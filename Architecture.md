# ARCHITECTURE

**Purpose:** Defines the structural patterns, technology stack, and deep system architecture for the Pro Deal Industries platform, engineered for 99.99% uptime, strict data integrity, and operational observability.

---

## 1. Technology Stack & Infrastructure Topology

- **Frontend Edge:** Next.js 14 App Router deployed on Vercel Edge.
- **State & Caching:** Zustand (Client Transient State) + Next.js Data Cache (Server Memoization).
- **Primary Datastore:** Supabase PostgreSQL (Strictly typed, RLS enabled).
- **Event Bus / Async Queue:** Upstash Redis (Rate limiting, Deduplication, and lightweight queues).
- **Communication Adapter:** Meta WhatsApp Business API.

---

## 2. The 3-Tier Security & Validation Perimeter

Never trust the client. Never trust the network.
1. **Edge Perimeter (Upstash Redis):** IP-based rate limiting prevents DDoS and form spam before the request even wakes up the database connection pool.
2. **Middleware Perimeter (Zod):** Strict schema validation. Extra payloads are stripped. Malformed data is instantly rejected with precise validation errors.
3. **Database Perimeter (Supabase RLS):** Row Level Security ensures that even if the API is compromised, the database rejects unauthorized mutations. `SUPABASE_SERVICE_ROLE_KEY` is completely isolated to secure server actions.

---

## 3. Asynchronous Workflow & Idempotency

**The Quote Submission Pipeline:**
This is not a simple REST call. It is a distributed transaction.
1. **Client Request:** Submits payload with a client-generated UUID (Idempotency Key).
2. **API Route:** Checks Redis to see if the UUID was already processed in the last 60 seconds (prevents double-clicks/replay attacks).
3. **Database Write:** Stores the inquiry in Supabase.
4. **Async Handoff:** The WhatsApp notification is dispatched *non-blockingly*. If Meta's API is down, we log a failure locally but return a `200 OK` to the user. The database write is the single source of truth.

---

## 4. Frontend Rendering Strategy (Mechanical Sympathy)

- **Server Components (RSC) by Default:** All heavy libraries, data fetching, and formatting happen on the server to keep the client JS bundle near zero.
- **Lazy Hydration:** Client components (`'use client'`) are pushed to the absolute edges of the component tree (e.g., just the `SubmitButton` or `CarouselControls`).
- **Edge Caching:** Division catalogs revalidate at specific intervals based on their business domain (Bowls: 5m, Signages: 1h). No database hits for anonymous traffic.

---

## 5. Directory Topology & Bounded Contexts (Domain-Driven Design)

Do not build a monolithic `components/` folder. Organize by **Domain**:
- `src/domains/chemicals/` (Strict CAS validation, SDS rules)
- `src/domains/bowls/` (Inventory stock rules)
- `src/infrastructure/adapters/` (WhatsApp client, Upstash client)
- `src/ui/` (Refined, stateless Minimalist design tokens)
