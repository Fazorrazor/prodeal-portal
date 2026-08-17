# ARCHITECTURAL DECISION RECORDS (ADRs)

**Purpose:** The historical log of high-impact engineering decisions. Every entry must reflect veteran-level pragmatism—favoring boring, proven, and scalable tech over hype, and solving for Day-2 operations.

---

## ADR-001: Next.js App Router (Server-First)
**Status:** Accepted
**Decision:** We exclusively use the Next.js 14 App Router, defaulting to React Server Components (RSC).
**Rationale:** We minimize the client-side JavaScript payload to prevent browser main-thread blocking, significantly improving Time to Interactive (TTI) on low-end B2B corporate hardware. Server components ensure sensitive pricing logic never reaches the client.

## ADR-002: Supabase Without Client Auth
**Status:** Accepted
**Decision:** Client-side authentication is explicitly banned for public users.
**Rationale:** Friction kills B2B conversion. Forcing procurement managers to create accounts abandons the funnel. Instead, we use a decentralized trust model: A secure `tracking_uuid` generated server-side acts as a bearer token for checking quote status at `/track/[id]`.

## ADR-003: Hexagonal Architecture for External Vendors (WhatsApp)
**Status:** Accepted
**Decision:** The WhatsApp API must be abstracted behind an internal `NotificationService` interface.
**Rationale:** Meta's API will inevitably change. By isolating their specific JSON payloads and error codes behind an adapter, we prevent vendor lock-in and vendor-specific bugs from bleeding into our core inquiry logic. We own our domain; vendors merely plug into it.

## ADR-004: Redis-Backed Idempotency Locks
**Status:** Accepted
**Decision:** All POST requests (quote submissions) require a client-generated UUID idempotency key, verified via Upstash Redis.
**Rationale:** Network latency often causes users to click "Submit" multiple times. Without idempotency, we risk duplicating database records, corrupting analytics, and spamming staff via WhatsApp. Redis `SETNX` guarantees exactly-once processing.

## ADR-005: Data-Dense B2B Brutalism (Performance via Aesthetics)
**Status:** Accepted
**Decision:** We strictly enforce "Naked Canvas" Brutalism—zero drop shadows, zero floating white cards, zero decorative icons.
**Rationale:** Aesthetic choices dictate application performance. By removing complex CSS box-shadows, blurs, and SVGs, we drastically reduce browser paint times (Layout/Repaint thrashing). This results in a terminal-fast, instantly responsive UI that communicates utilitarian professionalism.
