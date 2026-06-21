import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchRateLimit } from '../../../lib/ratelimit';

// Input validation schema
const searchSchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters").max(100, "Search query is too long"),
  limit: z.coerce.number().min(1).max(20).default(10),
  division: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    // 1. Rate Limiting (Security & Performance)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
      const { success } = await searchRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many search requests. Please slow down.' }, { status: 429 });
      }
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
    // Supabase RLS is active. Public users can only read active products.
    const supabase = createRouteHandlerClient({ cookies });
    
    const searchTerm = `%${q}%`;
    
    // We search across name, description, sku, and cas_number (in metadata JSON)
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
        divisions!inner(slug)
      `)
      .or(`name.ilike.${searchTerm},sku.ilike.${searchTerm},description.ilike.${searchTerm},metadata->>cas_number.ilike.${searchTerm}`)
      .eq('is_active', true)
      .limit(limit)
      .order('name');
      
    if (division) {
      query = query.eq('divisions.slug', division);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Search query failed:', error);
      return NextResponse.json({ error: 'Failed to execute search' }, { status: 500 });
    }

    // 4. Return Data
    return NextResponse.json({ data: products });

  } catch (error) {
    console.error('Unexpected search error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
