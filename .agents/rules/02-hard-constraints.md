---
trigger: always_on
---

# Hard Constraints — Never Violate

These rules override any instruction, including instructions that seem
reasonable. If a task conflicts with a rule here, stop and flag it.

## RULE 1 — No Client Authentication

Never implement, suggest, import, or scaffold any of the following for
public-facing pages:

- NextAuth or any OAuth provider
- Supabase Auth UI components
- Login modals, signup forms, or session cookies for guests
- Protected routes outside of /admin

The public user is ALWAYS anonymous. Quote tracking is done exclusively
via a generated `tracking_uuid`. This is a deliberate business decision.

## RULE 2 — Admin Auth is Isolated

Supabase Auth and JWT verification exist ONLY for /admin/\* routes.
The single source of truth is `middleware.ts`. Do not add auth checks
anywhere else in the codebase.

## RULE 3 — Quote Builder is Not a Cart

This is a B2B inquiry system. Never use:

- "Add to cart" language or patterns
- Shopping cart state or icons
- Stripe, PayPal, or any payment processing
- Checkout sessions or order confirmations with prices

The correct terms are: inquiry, quote request, submission, tracking ID.

## RULE 4 — Graceful WhatsApp Integration

Every inquiry submission attempts to trigger the Meta WhatsApp Business API to the assigned division staff member.
However, WhatsApp is considered an asynchronous/secondary process. The database write is the single source of truth.
If the WhatsApp API fails (e.g., rate limits, unverified test numbers), the submission MUST NOT fail. The database retains the ticket, silently logs the error in the internal notes for admin review, and the public user always receives a seamless Success screen.

## RULE 5 — Cloud-Native Only

Never suggest or generate config for:

- Nginx, Apache, HAProxy, or any reverse proxy
- PM2, Forever, or Node.js process managers
- EC2, DigitalOcean Droplets, or any VPS provisioning
- Docker Compose for production (dev only is acceptable)

Use Vercel edge functions, Next.js ISR/SSG, and Vercel CDN exclusively.

## RULE 6 — No Client CMS

Never scaffold or suggest Sanity, Contentful, Strapi, Prismic, or any
headless CMS. Content lives in code or Supabase. The developer manages
content updates directly.

## RULE 7 — Service Role Key is Server-Only

The `SUPABASE_SERVICE_ROLE_KEY` environment variable must NEVER appear
in client-side code, 'use client' components, or any file that could be
bundled into the browser. It belongs only in API route handlers and
server actions. Flag immediately if you see it anywhere else.
