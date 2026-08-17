# TASKS

**Purpose:** The central roadmap and active checklist for building the Pro Deal Industries platform. 

---

## Phase 1: Architecture & Design System Setup
- [x] Initialize Next.js 14 App Router project.
- [x] Configure Tailwind CSS with strictly defined B2B Brutalism tokens.
- [x] Set up Supabase project and define `products`, `inquiries`, and `divisions` schemas.
- [x] Purge scattered documentation and establish centralized architectural `.md` files.

## Phase 2: Division Catalogs (Public Facing)
- [x] Build isolated components for **Souvenirs & Printing** (`ProductCatalog.tsx`).
- [x] Build isolated components for **Industrial Chemicals** (`ChemicalCatalog.tsx`).
- [x] Build isolated components for **Disposable Bowls** (`InventoryTable.tsx`).
- [x] Build isolated components for **3D Signages** (`SignageGallery.tsx`).
- [x] Refactor all catalogs to enforce the "Naked Canvas" brutalist aesthetic (No floating cards/shadows).

## Phase 3: UI Paradigm Shift (Minimalist / Luxury Overhaul)
- [x] Refactor `ProductCatalog.tsx` to use high-whitespace, borderless product cards.
- [x] Refactor `ChemicalCatalog.tsx` to align with the elegant flat design system.
- [x] Refactor `InventoryTable.tsx` for cleaner typography and generous padding.
- [x] Refactor `SignageGallery.tsx` for a curated boutique gallery feel.
- [x] Implement fluid micro-interactions (soft hovers, smooth fades) globally.

## Phase 4: Quote Builder & Inquiry Flow
- [ ] Implement Mobile-First Quote Builder modal/page for each division.
- [ ] Enforce division-specific Zod validation (e.g., CAS numbers for chemicals, artwork uploads for signages).
- [ ] Implement Upstash Redis rate-limiting on submission endpoints.
- [ ] Handle 3-state async UI (Loading, Success, Error).

## Phase 4: Operations & Handoff
- [ ] Configure Supabase database writes for new inquiries.
- [ ] Implement Tracking UUID generation and the `/track/[id]` client view.
- [ ] Integrate Meta WhatsApp Business API for instant staff notification.
- [ ] Ensure WhatsApp dispatch acts as a secondary async process (fail gracefully).

## Phase 5: Admin Portal
- [ ] Configure Supabase Auth middleware for `/admin/*` routes.
- [ ] Build Inventory Management interface (critical for Bowls division).
- [ ] Build Inquiry Management dashboard for tracking open quotes.
- [ ] Secure `SUPABASE_SERVICE_ROLE_KEY` operations.
