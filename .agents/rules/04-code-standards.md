---
trigger: always_on
---

# Code Standards — Quality is Non-Negotiable

## Component Default: Server First

Every component is a React Server Component by default. Only add
'use client' at the top when you genuinely need one of these:

- Browser APIs (window, document, navigator)
- Event handlers (onClick, onChange, onSubmit)
- useState, useEffect, useReducer, useRef hooks
- Zustand store access

When you add 'use client', add a one-line comment explaining why:
// 'use client' — needs useState for accordion open/close state

## Error Boundaries are Mandatory

Wrap every async Server Component data fetch in a DivisionErrorBoundary.
A single failed Supabase query must never crash the entire page. The
boundary must show a branded error state with a retry action, not a
generic white screen.

## Validation: Zod on All External Data

Validate with Zod BEFORE any database operation, on:

- All API route request bodies (POST, PATCH)
- All form submissions before they leave the client
- Supabase query results used in critical write flows

Never do: const { name } = req.body followed immediately by a db insert.

## API Route Contract

Every API route handler must follow this exact sequence:

1. Check Upstash rate limit → return 429 if exceeded
2. Validate request body with Zod → return 400 with field errors if invalid
3. Verify auth if admin route (getUser from Supabase)
4. Execute database operation
5. Return consistent response shape

Error response shape: { error: string, code?: string, field?: string }
Never expose raw Supabase error messages, Postgres error codes, or stack
traces to the client.

## TypeScript: No any

Never use `any`. If you do not know a type:

- Infer it from the Supabase generated types (database.types.ts)
- Write a proper interface or type alias
- Use `unknown` with a type guard if the shape is truly dynamic

## Zustand: State Only, No Side Effects

Store actions must be pure state updates. API calls, Supabase queries,
and side effects happen in component event handlers, not inside store
actions. The store holds state. Components orchestrate logic.

## File Upload: Three-Layer Enforcement

MIME type and size limits must be enforced at all three layers. Removing
any one is a security regression:

1. react-dropzone `accept` prop — client UX gate
2. /api/upload route handler — server security gate
3. Supabase Storage bucket policy — database enforcement

Allowed types: image/jpeg, image/png, image/webp, image/svg+xml,
application/pdf, application/postscript
Maximum size: 10MB (10485760 bytes) — hard ceiling, not a guideline

## Caching Defaults

- Homepage /: revalidate = 3600
- /divisions/[slug]: revalidate = 1800
- /divisions/bowls: revalidate = 300 (inventory changes frequently)
- /track/[trackingId]: cache = 'no-store' (always fresh)
- All /admin routes: cache = 'no-store' (always fresh)
