import { createServiceRoleClient } from '../../../lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchRateLimit } from '../../../lib/ratelimit';
import Fuse from 'fuse.js';
export const dynamic = 'force-dynamic';

// Input validation schema
const searchSchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters").max(100, "Search query is too long"),
  limit: z.coerce.number().min(1).max(20).default(10),
  division: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    // 1. Rate Limiting (Security & Performance)
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const { success } = await searchRateLimit.limit(ip);
        if (!success) {
          return NextResponse.json({ error: 'Too many search requests. Please slow down.' }, { status: 429 });
        }
      }
    } catch (e) {
      console.warn('[Rate Limit Warning] Search route rate limit check failed, failing open', e);
    }

    // 2. Query Parameter Validation
    const url = new URL(req.url);
    const parseResult = searchSchema.safeParse({
      q: url.searchParams.get('q'),
      limit: url.searchParams.get('limit') || 10,
      division: url.searchParams.get('division') || undefined
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { q, limit, division } = parseResult.data;

    // 3. Database Query (Safe & Efficient)
    // This is a public read-only endpoint — no session cookie required.
    // We use the service role client so we avoid the async-cookies crash.
    // RLS on the products table (is_active = true) still enforces what is visible.
    const supabase = createServiceRoleClient();
    
    // Fetch active products for the division
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        category,
        description,
        image_path,
        division_id,
        divisions!inner(slug),
        metadata
      `)
      .eq('is_active', true);
      
    if (division) {
      query = query.eq('divisions.slug', division);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Search query failed:', error);
      return NextResponse.json({ error: 'Failed to execute search' }, { status: 500 });
    }

    // 4. Perform fuzzy search using Fuse.js
    const fuse = new Fuse(products || [], {
      keys: [
        'name',
        'sku',
        'description',
        'metadata.cas_number'
      ],
      threshold: 0.3, // Lower threshold means stricter matching
      distance: 100,
      ignoreLocation: true // Helps match words regardless of position
    });

    // If query is empty somehow, just return the first few products, 
    // otherwise return fuzzy match results
    let finalData = products || [];
    if (q) {
      const results = fuse.search(q);
      finalData = results.map(r => r.item);
    }

    const topResults = finalData.slice(0, limit);

    // 5. Return Data
    return NextResponse.json({ data: topResults });

  } catch (error) {
    console.error('Unexpected search error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
