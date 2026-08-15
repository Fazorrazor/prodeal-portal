# Pro Deal Industries — Agent Build Guide v2.0
### The Complete, Corrected Prompting Playbook for Antigravity

> **This document supersedes the v1.0 build guide.**  
> Every prompt has been realigned to the exact component names, table schemas, and flows defined in `ARCHITECTURE.md`. Do not mix these prompts with the old guide.

---

## Before You Touch Anything — Read This

The architecture you are building is **not a simple marketing site**. It has a multi-table PostgreSQL schema with Row Level Security, a WhatsApp Business API handshake, a rate-limited file upload pipeline, and a fully protected admin dashboard. If you rush the sequence or skip a phase, you will spend more time debugging than building.

The rules are simple:

1. **Do not move to the next prompt until the current phase passes its verification checklist.** Every prompt ends with one. Run it.
2. **Commit to Git after every successful phase.** If Antigravity breaks something in Phase 6, you roll back to Phase 5, not to zero.
3. **The component names in ARCHITECTURE.md are law.** If Antigravity invents a name that isn't in the architecture, stop it immediately and use the correction scripts at the bottom of this document.
4. **You will need real credentials** for Supabase, Meta WhatsApp Business API, and Upstash Redis before Phase 6. Get them early. Don't wait.

---

## Step 0 — Pre-Flight (Do This Before Opening Antigravity)

This is not optional. Skipping pre-flight is the number one reason agent builds fail mid-way.

**Account Setup Checklist:**
- [ ] Supabase project created, note down: Project URL, Anon Key, Service Role Key
- [ ] Meta WhatsApp Business API access approved, note down: Phone Number ID, Permanent System User Token
- [ ] Upstash Redis database created (free tier works), note down: REST URL, REST Token
- [ ] GitHub repository created and linked to Vercel
- [ ] Domain connected to Vercel (or use the `.vercel.app` preview URL for now)

Create your project folder. Place `ARCHITECTURE.md` in the root. This file is the agent's single source of truth. If you are ever unsure whether Antigravity is building something correctly, point it back to `ARCHITECTURE.md` before correcting it.

---

---

## Phase 1 — Context Initialization & Environment Setup

### What This Phase Builds
A working Next.js 14 App Router project with all dependencies installed, the design system tokens wired into Tailwind, and the environment variable file created. No UI. No components. Just the skeleton.

---

### Prompt 1A: Ingestion & Acknowledgement

> "Read the `ARCHITECTURE.md` file in this directory. This is your master blueprint and absolute source of truth for this entire project. Before you write a single line of code, I need you to explicitly acknowledge three non-negotiable constraints:
>
> 1. There is **NO client-side authentication** anywhere on the public-facing site. The quote builder is open to any guest with no login. Do not add NextAuth, Supabase Auth, or any login flow to the public routes. Ever.
> 2. All admin routes (`/admin/*`) use **Supabase Auth JWT** enforced at the Next.js middleware layer — this is the ONLY authentication in the entire app.
> 3. Every component name you build must match exactly what is defined in ARCHITECTURE.md. Do not rename, merge, or invent components.
>
> Acknowledge these three constraints explicitly, then wait for my next instruction."

---

### Prompt 1B: Project Initialization

> "Now initialize the project. Run the following in sequence:
>
> 1. Bootstrap a new Next.js 14 App Router project with TypeScript and Tailwind CSS using `pnpm` as the package manager.
> 2. Install every dependency listed in **Appendix B** of ARCHITECTURE.md — both `dependencies` and `devDependencies`. Use the exact versions specified.
> 3. Create the `tailwind.config.ts` file with the complete design system tokens from **Section 1.1**: all six brand color tokens and all three font family tokens (`display`, `heading`, `body`). Use the exact hex codes. Never hardcode colors in components.
> 4. Create a `.env.local` file with every variable listed in **Section 3.7**. Populate the values with placeholder strings in the format `REPLACE_WITH_YOUR_VALUE` so I can fill them in. Do not hardcode real credentials.
> 5. Create the `globals.css` file with the Google Fonts import for Bebas Neue, DM Sans, and IBM Plex Sans.
>
> Do not create any components, pages, or routes yet. Stop and wait for my review."

---

### Phase 1 Verification Checklist

Before moving to Phase 2, confirm all of the following:

- [ ] `pnpm install` runs without errors
- [ ] `tailwind.config.ts` contains all 6 brand color tokens with exact hex codes
- [ ] All 3 font families are defined in `tailwind.config.ts`
- [ ] `.env.local` exists with all 10 variables from Section 3.7
- [ ] `package.json` matches the dependency list in Appendix B
- [ ] `pnpm build` completes without TypeScript errors on the empty project

**Git commit: `feat: project initialization and design system`**

---

---

## Phase 2 — Database Schema, Storage & State Layer

### What This Phase Builds
Every Supabase migration file, all RLS policies, storage bucket policies, all Zod validation schemas, and the Zustand quote builder store. **The backend is fully defined before a single UI component is built.**

This phase has no visible UI output. That is correct. The data layer must be solid before anything touches it.

---

### Prompt 2A: Database Migrations

> "Referencing **Section 2.1** and **Section 3.9** of ARCHITECTURE.md, create the Supabase migration files. Place them in `/supabase/migrations/` using the exact filenames from Section 3.9:
>
> - `20240101000000_initial_schema.sql` — Create all **five** tables in this exact order: `divisions`, `staff_members`, `inquiries`, `inquiry_events`, `products`. Include the `update_updated_at()` trigger function and the trigger on the inquiries table. Include all indexes defined in Section 2.1.
> - `20240101000001_rls_policies.sql` — All RLS policies from **Section 3.3** for `inquiries`, `staff_members`, and `products` tables. Enable RLS on each table before defining its policies.
> - `20240101000002_storage_buckets.sql` — Create the two storage buckets from **Section 2.2**: `inquiry-attachments` (private) and `product-images` (public). Include the storage RLS policy that restricts uploads by MIME type and file size.
> - `20240101000003_seed_divisions.sql` — The four `INSERT` statements to seed the `divisions` table from Section 2.1.
>
> Also create `supabase/config.toml`.
>
> Stop and wait for my review. Do not build any Supabase clients yet."

---

### Prompt 2B: Supabase Clients, Validators & State Store

> "Referencing **Section 3.1**, **Section 3.4**, **Section 2.2**, and **Section 1.5.1** of ARCHITECTURE.md, build the backend utilities layer:
>
> 1. **Supabase clients:** Create `lib/supabase/client.ts` (browser client using `createClientComponentClient`) and `lib/supabase/server.ts` (server-side client using `createServerComponentClient`). Import from `@supabase/auth-helpers-nextjs`.
>
> 2. **Zod validators:** Create `lib/validators/inquiry.ts` with all six schemas from Section 3.1 exactly as specified: `ContactDetailsSchema`, `SignageInquirySchema`, `PrintingInquirySchema`, `BowlsInquirySchema`, `ChemicalInquirySchema`, and the `InquirySubmissionSchema` wrapper. Also export the `DIVISION_SCHEMAS` map.
>
> 3. **Rate limiters:** Create `lib/ratelimit.ts` with the three rate limiters from Section 3.4: `inquiryRateLimit` (3/hr), `whatsappRateLimit` (60/hr), `uploadRateLimit` (20/hr). Use `Ratelimit.slidingWindow`.
>
> 4. **File validator:** Create `lib/upload/validateFile.ts` with the `validateFileUpload` function from Section 3.2. Include all allowed MIME types and the 10MB ceiling.
>
> 5. **Zustand store:** Create `store/quoteStore.ts` with the complete `QuoteState` interface and all actions from **Section 1.5.1**: `openBuilder`, `closeBuilder`, `nextStep`, `prevStep`, `setContactDetails`, `setInquiryDetails`, `addFile`, `removeFile`, `setTrackingId`, and `reset`.
>
> Stop and wait for my review."

---

### Phase 2 Verification Checklist

- [ ] All 4 migration files exist in `/supabase/migrations/` with correct filenames
- [ ] All 5 tables are in `_initial_schema.sql` (divisions, staff_members, inquiries, **inquiry_events**, **products**)
- [ ] RLS is enabled on all 3 tables in `_rls_policies.sql`
- [ ] Both storage buckets are created with policies in `_storage_buckets.sql`
- [ ] `lib/validators/inquiry.ts` exports all 6 schemas + `DIVISION_SCHEMAS`
- [ ] `store/quoteStore.ts` has all 10 actions in the interface
- [ ] `pnpm typecheck` passes with no errors

**Git commit: `feat: database schema, validators, rate limiters, and state store`**

---

---

## Phase 3 — Global Layout Shell

### What This Phase Builds
The root layout, Navbar with mobile drawer, Footer, error boundary, and all global providers. This is the chrome that wraps every page on the site.

---

### Prompt 3A: Providers & Layout Primitives

> "Referencing **Section 1.2** of ARCHITECTURE.md, build the global layout infrastructure:
>
> 1. **Providers:** Create `app/providers/ZustandProvider.tsx` (Zustand store hydration guard) and `app/providers/ToastProvider.tsx` (Sonner toast context).
>
> 2. **Root layout:** Create `app/layout.tsx` — the RootLayout that injects the Google Fonts, wraps the app in `ZustandProvider` and `ToastProvider`, and sets the HTML lang attribute to `en`.
>
> 3. **Shared error boundary:** Create `components/shared/DivisionErrorBoundary.tsx` using the exact implementation from **Section 1.7** of ARCHITECTURE.md. This component must be a class component as specified. It will wrap every async server component data-fetch block across the site.
>
> Stop and wait for my review."

---

### Prompt 3B: Navbar & Footer

> "Referencing **Section 1.2** and the Navbar Specification table in **Section 1.2.1** of ARCHITECTURE.md, build the navigation and footer components:
>
> 1. **Navbar:** Create `components/layout/Navbar.tsx` as the parent. Then create its three children as separate files:
>    - `NavLogo.tsx`
>    - `NavLinks.tsx` — Six links: Home · 3D Signages · Souvenirs & Printing · Disposable Bowls · Chemicals · Contact. Links map to `/` and `/divisions/[slug]` routes using the division slugs from the seed data.
>    - `MobileDrawer.tsx` — Right slide-in sheet using `framer-motion`, rendered on screens below 1024px.
>
>    The Navbar must implement all four states from the specification table: desktop horizontal layout, mobile hamburger, scroll behavior at >80px (`backdrop-blur-md bg-brand-deep-blue/90 shadow-xl` transition), and active division indicator.
>
> 2. **Footer:** Create `components/layout/Footer.tsx` and its three children: `FooterBrand.tsx`, `FooterLinks.tsx`, `FooterLegal.tsx`.
>
> 3. **Public layout:** Create `app/(public)/layout.tsx` that composes `<Navbar>` and `<Footer>` around `{children}`.
>
> Use only brand color tokens from `tailwind.config.ts`. No hardcoded hex values.
>
> Stop and wait for my review."

---

### Phase 3 Verification Checklist

- [ ] Mobile drawer animates in/out correctly on screens <1024px
- [ ] Navbar background transitions on scroll past 80px
- [ ] Active division link shows underline indicator in `brand-blue`
- [ ] `DivisionErrorBoundary` renders its fallback UI and has a working retry button
- [ ] No hardcoded color values in any component — only `brand-*` Tailwind tokens
- [ ] `pnpm typecheck` passes

**Git commit: `feat: global layout, navbar, footer, error boundary, providers`**

---

---

## Phase 4 — Homepage

### What This Phase Builds
The complete homepage with all six sections, ISR caching configured, and skeleton/error states for the dynamic section.

---

### Prompt 4: Homepage Sections

> "Referencing **Section 1.3** of ARCHITECTURE.md, build the homepage. The root file is `app/(public)/page.tsx` — this is an **async Server Component** with `export const revalidate = 3600` (ISR, 1 hour) as defined in **Section 3.6**.
>
> Build each section as a separate file in `sections/`:
>
> 1. **`HeroSection.tsx`** — Full-viewport hero. Contains:
>    - `HeroBackground.tsx` — `next/image` with `priority` and `blur` placeholder. Use a placeholder image URL for now.
>    - `HeroHeadline.tsx` — Animated headline using `framer-motion` `staggerChildren`.
>    - `HeroCTAGroup.tsx` — Primary CTA button (brand-blue) linking to divisions, secondary CTA.
>
> 2. **`DivisionsGrid.tsx`** — 4-column card grid. Contains `DivisionCard.tsx` (×4), `DivisionCardSkeleton.tsx` (pulse skeleton, identical dimensions), and `ErrorBoundary.tsx` (per-card error state). Each card links to `/divisions/[slug]`.
>
> 3. **`WhyChooseUs.tsx`** — 3-column feature highlight section.
>
> 4. **`ProcessTimeline.tsx`** — Horizontal scroll on desktop, vertical stack on mobile.
>
> 5. **`TestimonialsCarousel.tsx`** — Static hardcoded testimonial data. No CMS.
>
> 6. **`ContactBannerCTA.tsx`** — Full-width brand-red banner with a WhatsApp direct link. The link format is `https://wa.me/233XXXXXXXXX` — use a placeholder number for now.
>
> Wrap the `DivisionsGrid` in the `DivisionErrorBoundary` component built in Phase 3.
>
> Stop and wait for my review."

---

### Phase 4 Verification Checklist

- [ ] `page.tsx` has `export const revalidate = 3600`
- [ ] All 6 sections render without errors
- [ ] `DivisionCardSkeleton` is the same dimensions as `DivisionCard`
- [ ] `DivisionsGrid` is wrapped in `DivisionErrorBoundary`
- [ ] `HeroHeadline` animation works on page load
- [ ] Page is responsive on mobile
- [ ] `pnpm build` succeeds (ISR static generation for this route)

**Git commit: `feat: homepage with all six sections and ISR config`**

---

---

## Phase 5 — Division Pages & Per-Division Components

### What This Phase Builds
The dynamic `/divisions/[slug]` routing, the shared `DivisionLayout` wrapper, and all four division-specific content components. This is a high-risk phase for component name drift — keep ARCHITECTURE.md open.

---

### Prompt 5A: Division Routing & Layout Wrapper

> "Referencing **Section 1.4** of ARCHITECTURE.md, build the division page routing infrastructure:
>
> 1. **Dynamic route:** Create `app/(public)/divisions/[slug]/page.tsx`. This is a Server Component. Add `export const revalidate = 1800` (30 minutes ISR). Add `generateStaticParams` that returns the four slugs: `signages`, `printing`, `bowls`, `chemicals`. The bowls page is the **exception** — it gets `export const revalidate = 300` (5 minutes) because inventory changes frequently. Handle this by checking the slug and setting the correct revalidation.
>
> 2. **Shared division wrapper:** Create `components/division/DivisionLayout.tsx`. This wraps all division pages with a shared hero banner and a `{children}` content slot. Its two children are:
>    - `DivisionHero.tsx` — Division name, tagline, and breadcrumb.
>    - `DivisionContent.tsx` — The `{children}` slot.
>
> The `[slug]/page.tsx` should render `<DivisionLayout>` and pass the correct division-specific content component based on the slug. Use a switch statement or object map — do not use dynamic imports that break static generation.
>
> Stop and wait for my review."

---

### Prompt 5B: 3D Signages & Souvenirs Division Components

> "Referencing the 3D Signages and Souvenirs & Printing sections in **Section 1.4** of ARCHITECTURE.md, build these components. Use **Server Components for all data fetching**.
>
> **3D Signages division** (`components/division/3d-signages/`):
> - `SignageGallery.tsx` — Masonry grid of project images fetched from Supabase Storage `product-images` bucket. Contains `GalleryImage.tsx` (Next/Image + lightbox trigger) and `GallerySkeleton.tsx` (shimmer grid placeholders).
> - `ProjectFAQ.tsx` — Accordion with questions about turnaround, materials, and design process.
> - `SignageQuoteCTA.tsx` — CTA button that opens the Quote Builder modal with the `signages` division pre-selected. Wire to the Zustand `openBuilder('signages')` action.
>
> **Souvenirs & Printing division** (`components/division/souvenirs-printing/`):
> - `ProductCatalog.tsx` — Grid of product cards fetched from the `products` table filtered by division. Contains `ProductCard.tsx` (image, name, min-order, price range badge) and `ProductCardSkeleton.tsx`.
> - `ProductFilters.tsx` — Category filter pills. This is a **Client Component**.
> - `PrintingOrderCTA.tsx` — CTA that opens the Quote Builder with `printing` pre-selected.
>
> Wrap all async data-fetch sections in `DivisionErrorBoundary`.
>
> Stop and wait for my review."

---

### Prompt 5C: Disposable Bowls & Chemicals Division Components

> "Referencing the Disposable Bowls and Chemicals sections in **Section 1.4** of ARCHITECTURE.md, build these components.
>
> **Disposable Bowls division** (`components/division/disposable-bowls/`):
> - `InventoryTable.tsx` — **Server Component**. Fetches from `products` table. Columns: SKU, size, material, MOQ, stock badge. Contains `StockBadge.tsx` (three states: 'In Stock' green / 'Low Stock' amber / 'Out' red — derive from `metadata.stock_level`) and `InventoryTableSkeleton.tsx` (5-row shimmer).
> - `BulkOrderNote.tsx` — Info callout card explaining MOQ policy and lead times.
> - `BowlsOrderCTA.tsx` — CTA that opens Quote Builder with `bowls` pre-selected.
>
> **Chemicals division** (`components/division/chemicals/`):
> - `ChemicalCatalog.tsx` — **Server Component** for initial data fetch. Card grid containing `ChemicalCard.tsx` (name, CAS number, grade, `SDSDownloadButton.tsx`) and `ChemicalCardSkeleton.tsx`.
> - `SDSDownloadButton.tsx` — On click, calls a server action or API route to generate a Supabase Storage signed URL for the SDS file. Uses the `inquiry-attachments` bucket (private).
> - `ChemicalSearchBar.tsx` — **Client Component** with debounced input (300ms delay). Stores search term in a dedicated Zustand slice — add a `chemicalSearch` slice to `store/quoteStore.ts` with `searchTerm` state and `setSearchTerm` action.
> - `ChemicalFilters.tsx` — **Client Component**. Filter pills: Industrial / Lab / Specialty.
> - `SafetyNotice.tsx` — Regulatory callout banner with a brand-red border.
> - `ChemicalInquiryCTA.tsx` — CTA that opens Quote Builder with `chemicals` pre-selected.
>
> Stop and wait for my review."

---

### Phase 5 Verification Checklist

- [ ] `/divisions/signages` renders without errors
- [ ] `/divisions/printing` renders without errors
- [ ] `/divisions/bowls` renders without errors — confirm `revalidate = 300` in its page
- [ ] `/divisions/chemicals` renders without errors
- [ ] `ChemicalSearchBar` debounce works correctly (no API call on every keystroke)
- [ ] `SDSDownloadButton` generates a signed URL (test with a dummy file in Supabase Storage)
- [ ] `StockBadge` shows correct colors for all three states
- [ ] `openBuilder('signages')` action fires when SignageQuoteCTA is clicked (Zustand DevTools)
- [ ] No hardcoded component names that differ from ARCHITECTURE.md
- [ ] `pnpm build` completes — all 4 division pages are statically generated

**Git commit: `feat: all four division pages with components`**

---

---

## Phase 6 — File Upload API Route

### What This Phase Builds
The server-side file upload endpoint. This is its own phase because it intersects file security, rate limiting, and Supabase Storage — three systems at once. It must be working and tested before the Quote Builder is built on top of it.

---

### Prompt 6: Upload API Route & Client Zone

> "Referencing **Section 3.2** and **Appendix A** of ARCHITECTURE.md, build the file upload pipeline:
>
> 1. **Server route:** Create `app/api/upload/route.ts`. This POST handler must do the following in strict order:
>    a. Extract the client IP from the request headers.
>    b. Check the `uploadRateLimit` from `lib/ratelimit.ts` (20 uploads per IP per hour). Return HTTP 429 if exceeded.
>    c. Parse the incoming `FormData` and extract the file.
>    d. Run `validateFileUpload(file)` from `lib/upload/validateFile.ts`. Return HTTP 400 with the error message if invalid.
>    e. Generate a unique storage path: `{divisionSlug}/{uuid}-{filename}`.
>    f. Upload to the `inquiry-attachments` bucket in Supabase Storage using the service role client (server-side only — never the anon client for uploads).
>    g. Return `{ fileId: uuid, path: storagePath, name: filename, size: bytes, mimeType: type }`.
>
> 2. **Client component:** Create `components/quote-builder/FileUploadZone.tsx` using `react-dropzone`. Configuration: 10MB max, allowed types matching `validateFile.ts`. Contains:
>    - `FilePreview.tsx` — Thumbnail for images, file icon for PDFs and other types.
>    - `UploadProgress.tsx` — Animated progress bar during upload.
>    The component should call `POST /api/upload` on file drop, update the Zustand store with `addFile()` on success, and display a clear error message on failure.
>
> Stop and wait for my review. Test a real file upload before proceeding."

---

### Phase 6 Verification Checklist

- [ ] Upload a JPEG under 10MB — succeeds and file appears in Supabase Storage dashboard
- [ ] Upload a `.exe` file — returns HTTP 400 with MIME type error
- [ ] Upload a file over 10MB — returns HTTP 400 with size error
- [ ] Submit 21 uploads from the same IP in one hour — returns HTTP 429 on the 21st
- [ ] Successful upload: Zustand store shows the file in `uploadedFiles`
- [ ] `FilePreview` renders thumbnail for images and icon for PDFs
- [ ] `UploadProgress` animates during upload

**Git commit: `feat: file upload API route with security validation and rate limiting`**

---

---

## Phase 7 — Quote Builder Modal & Submission Engine

### What This Phase Builds
The multi-step `QuoteBuilderModal` wired to Zustand, the inquiry submission API route, and the WhatsApp dispatch function. This is the highest-complexity phase in the entire build. Take it slow.

---

### Prompt 7A: Quote Builder Modal UI

> "Referencing **Section 1.5** of ARCHITECTURE.md, build the Quote Builder modal. All components go in `components/quote-builder/`.
>
> **Modal shell:** `QuoteBuilderModal.tsx` — backdrop, close button (resets Zustand store via `closeBuilder()`), and step progress bar. Contains `QuoteStepIndicator.tsx` (step 1/2/3/4 pill progress indicator in brand-blue).
>
> **The four steps** in `steps/`:
> - `Step1_DivisionConfirm.tsx` — Displays which division the user is inquiring about (from Zustand `division` state). Includes an option to change it.
> - `Step2_ContactDetails.tsx` — Fields: Full Name (required), Email (required), Phone (required, WhatsApp preferred), Company (optional). Contains `PhoneInput.tsx` — use `react-phone-number-input` with Ghana (`+233`) as the default country.
> - `Step3_InquiryDetails.tsx` — Renders the correct division-specific field component based on Zustand `division` state:
>   - `SignageInquiryFields.tsx` — Sign type selector, width (mm), height (mm), quantity, material preference, deadline, notes, and the `FileUploadZone` for artwork.
>   - `PrintingInquiryFields.tsx` — Product type, quantity, has artwork toggle, print sides selector, notes, and `FileUploadZone`.
>   - `BowlsInquiryFields.tsx` — SKU picker (populated from products table), quantity (enforces MOQ minimum of 100), delivery date, delivery address, notes.
>   - `ChemicalInquiryFields.tsx` — Product name, quantity (kg), grade selector (Industrial/Lab/Food/Pharmaceutical), intended use (required, minimum 10 chars for compliance), hazmat experience checkbox, notes.
> - `Step4_ReviewSubmit.tsx` — Summary card of all entered data, terms checkbox, and the Submit button. On submit, calls the Zustand `isSubmitting` flag and fires the API route.
>
> **Success state:** `SubmissionSuccess.tsx` — Displays the tracking UUID with a copy button. Shows link to `/track/[trackingId]`. Shows 'Message us on WhatsApp' direct link.
>
> Stop and wait for my review. Test navigating all four steps for each division type."

---

### Prompt 7B: Inquiry Submission API & WhatsApp Dispatch

> "Referencing **Section 2.4 (Flow A)** and **Section 2.5** of ARCHITECTURE.md, build the submission backend:
>
> 1. **WhatsApp utility:** Create `lib/whatsapp/buildMessage.ts` with the `buildWhatsAppMessage` function exactly as specified in Section 2.5. It takes `InquiryRow` and `DivisionRow` and returns the full `WhatsAppPayload`. Implement the `formatDivisionPayload` helper that formats the `inquiry_payload` JSONB for each division type.
>
> 2. **WhatsApp API route:** Create `app/api/whatsapp/route.ts`. This POST handler:
>    a. Accepts `{ inquiryId }` in the body.
>    b. Fetches the inquiry and its assigned staff member from Supabase (server-side client).
>    c. Checks `whatsappRateLimit` with key `wa:division:{divisionId}` (max 60/hr per division).
>    d. Calls `buildWhatsAppMessage()`.
>    e. POSTs to `https://graph.facebook.com/v19.0/{META_WA_PHONE_NUMBER_ID}/messages` with the `META_WA_ACCESS_TOKEN` in the Authorization header.
>    f. On success: `UPDATE inquiries SET wa_sent_at = now(), wa_message_id = {returnedMessageId}`.
>    g. Returns `{ success: true }` or a descriptive error.
>
> 3. **Inquiry submission route:** Create `app/api/inquiries/route.ts`. This POST handler must execute the exact sequence from **Section 2.4 Flow A, Steps 5a–5g**:
>    a. Parse request body.
>    b. Run `InquirySubmissionSchema.parse()` — reject with 400 on validation failure.
>    c. Dynamically validate the `inquiry` field against `DIVISION_SCHEMAS[divisionSlug]`.
>    d. Check `inquiryRateLimit` against client IP (max 3/hr).
>    e. Query `staff_members` for an active staff member assigned to this division.
>    f. `INSERT` into `inquiries` table — use the service role client.
>    g. `INSERT` into `inquiry_events` with `event_type: 'created'` and `actor_id: null` (system event).
>    h. Call `POST /api/whatsapp` internally with the new `inquiryId`.
>    i. Return `{ success: true, trackingId: tracking_uuid }`.
>
> Stop and wait for my review. Submit a real test inquiry and verify it appears in Supabase AND a WhatsApp message is received."

---

### Phase 7 Verification Checklist

- [ ] All four division field sets render correctly in Step 3
- [ ] `PhoneInput` defaults to Ghana (+233) flag
- [ ] `BowlsInquiryFields` rejects quantity below 100 (MOQ enforcement)
- [ ] `ChemicalInquiryFields` requires minimum 10 characters in 'intended use'
- [ ] Step 4 Review card shows all data entered in Steps 1–3
- [ ] Submitting a signages inquiry: row appears in `inquiries` table with correct `division_id`
- [ ] Submitting an inquiry: row appears in `inquiry_events` with `event_type: 'created'`
- [ ] WhatsApp message received on the staff member's phone
- [ ] `inquiries.wa_sent_at` is populated after successful dispatch
- [ ] `SubmissionSuccess` displays the correct `tracking_uuid`
- [ ] Submit 4 inquiries from same IP in one hour — 4th returns HTTP 429

**Git commit: `feat: quote builder modal, inquiry submission API, WhatsApp dispatch`**

---

---

## Phase 8 — Guest Inquiry Tracking Page

### What This Phase Builds
The public `/track/[trackingId]` page where guests can check the status of their inquiry. This is a **completely separate flow** (Flow B in Section 2.4) with no authentication. It intentionally exposes only sanitized, public-safe data.

---

### Prompt 8: Tracking Page & API Route

> "Referencing **Section 2.4 (Flow B)** and **Section 3.6** of ARCHITECTURE.md, build the guest tracking feature:
>
> 1. **Tracking API route:** Create `app/api/inquiries/[trackingId]/route.ts`. This GET handler:
>    a. Queries: `SELECT id, status, division_id, created_at, updated_at FROM inquiries WHERE tracking_uuid = $1`.
>    b. This query is intentionally limited — do NOT return `internal_notes`, `assigned_staff`, `contact_phone`, `contact_email`, or `wa_message_id`. These are internal fields.
>    c. If no record found, return HTTP 404.
>    d. Return the sanitized public-safe payload.
>
> 2. **Tracking page:** Create `app/(public)/track/[trackingId]/page.tsx`. Set `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` (always fresh, as specified in Section 3.6). The page:
>    a. Calls `GET /api/inquiries/[trackingId]` server-side.
>    b. If not found, renders a clear 'Inquiry not found' state with a link back to the homepage.
>    c. If found, renders a visual status timeline with four steps: **New → In Progress → Quoted → Closed**. The current status is highlighted in brand-blue.
>    d. Renders the inquiry's division name and submission date.
>    e. Shows a 'Contact us on WhatsApp' link for updates.
>
> Stop and wait for my review. Test by submitting a real inquiry and navigating to the tracking URL."

---

### Phase 8 Verification Checklist

- [ ] `/track/{valid-uuid}` renders the status timeline
- [ ] `/track/{invalid-uuid}` renders the not-found state
- [ ] The API response does NOT contain `internal_notes`, `assigned_staff`, or `wa_message_id`
- [ ] Current status is visually distinct from future steps
- [ ] Page always fetches fresh data (test by updating status in Supabase and refreshing)

**Git commit: `feat: guest inquiry tracking page and API route`**

---

---

## Phase 9 — Admin Dashboard

### What This Phase Builds
The fully protected admin panel. Middleware first, then login, then each admin page in order. Do not build any admin UI before the middleware is confirmed working.

---

### Prompt 9A: Middleware & Admin Layout

> "Referencing **Section 3.5** and **Section 1.6** of ARCHITECTURE.md, build the admin infrastructure. **Start with middleware first.**
>
> 1. **Middleware:** Create `middleware.ts` in the project root using the exact implementation from Section 3.5. It must:
>    - Only run on `/admin/*` routes.
>    - Skip the check on `/admin/login` itself.
>    - Use `createMiddlewareClient` from `@supabase/auth-helpers-nextjs`.
>    - Redirect to `/admin/login?redirectTo={originalPath}` if no valid session.
>    - Include the `config.matcher` export.
>
> 2. **Admin layout:** Create `app/admin/layout.tsx` — `AdminLayout` with sidebar and topbar shell. Contains:
>    - `components/admin/AdminSidebar.tsx` — Navigation: Dashboard, Tickets, Staff, Settings, Logout. Logout calls `supabase.auth.signOut()`.
>    - `components/admin/AdminTopbar.tsx` — Current user badge (email from session), notification bell, global search input.
>    - `components/admin/AdminAuthGuard.tsx` — Server-side session check using the server Supabase client. Redirects to `/admin/login` if session is invalid.
>
> 3. **Login page:** Create `app/admin/login/page.tsx` and `AdminLoginForm.tsx`. The form submits to Supabase Auth using `signInWithPassword`. On success, redirect to `/admin` (or `redirectTo` param if present). On failure, display the Supabase error message clearly.
>
> Stop and wait for my review. Verify that navigating to `/admin` without a session redirects to `/admin/login`."

---

### Prompt 9B: Admin Dashboard Overview & Ticket List

> "Referencing **Section 1.6** of ARCHITECTURE.md, build the admin dashboard overview and ticket list pages.
>
> **Dashboard overview** (`app/admin/page.tsx`):
> - `MetricsRow.tsx` containing four `MetricCard.tsx` components with animated count-up numbers: Total Inquiries, Pending (status = 'new' or 'in_progress'), Resolved (status = 'closed'), Average Response Time. Fetch counts from Supabase server-side.
> - `RecentTicketsTable.tsx` — Last 20 inquiries ordered by `created_at DESC`. Columns: Tracking ID, Division name, Contact Name, Status badge, Submission date.
>
> **Ticket list** (`app/admin/tickets/page.tsx`):
> - `TicketFilters.tsx` — **Client Component**. Division filter pills + Status dropdown (`new`, `in_progress`, `quoted`, `closed`) + date range picker.
> - `TicketTable.tsx` — Sortable table. Contains `TicketTableRow.tsx` (status badge color-coded: 'new' = brand-red, 'in_progress' = amber, 'quoted' = brand-blue, 'closed' = gray) and `TicketTableSkeleton.tsx` (10-row shimmer).
>
> **Data fetching:** All data fetching on admin pages uses the authenticated server Supabase client. RLS will automatically scope results to the staff member's division. Do not add manual division filtering in the query — let RLS handle it. This is the security guarantee.
>
> Stop and wait for my review."

---

### Prompt 9C: Ticket Detail View & Status Updates

> "Referencing **Section 1.6** and **Section 2.4 (Flow C)** of ARCHITECTURE.md, build the ticket detail page at `app/admin/tickets/[id]/page.tsx`.
>
> Build each sub-component:
> - `TicketDetailHeader.tsx` — Tracking ID (monospace font from Tailwind), division badge, submitted timestamp.
> - `TicketContactCard.tsx` — Contact name, email, phone. Phone renders as a click-to-WhatsApp link: `https://wa.me/{phone_number_without_plus}`.
> - `TicketInquiryDetails.tsx` — Renders the `inquiry_payload` JSONB dynamically. Use a switch on `division.slug` to format each payload type correctly (don't just dump raw JSON).
> - `TicketFileAttachments.tsx` — For each attachment in the `attachments` JSONB array, generate a Supabase Storage signed URL (60-second expiry) and render it as a download link with an appropriate file type icon.
> - `TicketStatusUpdater.tsx` — **Client Component**. Dropdown with the five statuses. On change: calls `PATCH /api/admin/inquiries/[id]` with the new status.
> - `TicketNotes.tsx` — **Client Component**. Textarea for internal staff notes. Auto-saves on blur. Notes are stored in `inquiries.internal_notes` and are **never** exposed on the public tracking page.
> - `TicketResendWhatsApp.tsx` — **Client Component**. 'Resend to WhatsApp' button. Calls `POST /api/whatsapp` with the `inquiryId`. The WhatsApp rate limit will block abuse automatically.
>
> **Admin API routes:**
> - `app/api/admin/inquiries/route.ts` — GET handler, returns paginated inquiries with division and staff info joined.
> - `app/api/admin/inquiries/[id]/route.ts` — PATCH handler. Validates auth session server-side. Updates `inquiries.status`. Inserts into `inquiry_events` with `event_type: 'status_changed'`, `actor_id: staffMemberId`, and `payload: { from: oldStatus, to: newStatus }`.
>
> Stop and wait for my review."

---

### Prompt 9D: Staff & Settings Pages

> "Referencing **Section 1.6** and **Appendix A** of ARCHITECTURE.md, build the remaining admin pages:
>
> 1. **Staff page** (`app/admin/staff/page.tsx`):
>    - `StaffAssignmentTable.tsx` — Table showing division → staff member mapping. Fetches from `staff_members` joined with `divisions`. Admin role can see all; agent role sees only their own record (enforced by RLS).
>
> 2. **Settings page** (`app/admin/settings/page.tsx`):
>    - WhatsApp configuration display (shows the configured phone number ID — does not expose the token).
>    - Division settings section (ability to toggle a division's `is_active` state in the `products` table).
>
> Stop and wait for my review."

---

### Phase 9 Verification Checklist

- [ ] Navigating to `/admin/tickets` without a session redirects to `/admin/login`
- [ ] Logging in with valid Supabase credentials redirects to `/admin`
- [ ] Staff member with `role: 'agent'` can only see their division's tickets (verify in Supabase RLS tester)
- [ ] Staff member with `role: 'admin'` sees all divisions
- [ ] Status update on a ticket: `inquiries.status` updates in DB AND `inquiry_events` row is inserted with `status_changed`
- [ ] `TicketContactCard` phone renders as working WhatsApp link
- [ ] `TicketNotes` saves correctly and note does NOT appear on the public tracking page
- [ ] `TicketResendWhatsApp` dispatches a WhatsApp message
- [ ] Signed URLs for file attachments work (test with an uploaded file)

**Git commit: `feat: complete admin dashboard with ticket management and staff pages`**

---

---

## Phase 10 — CI/CD Pipeline & Health Check

### What This Phase Builds
The GitHub Actions workflow, the health check API route, and final production readiness verification.

---

### Prompt 10: CI Pipeline & Health Route

> "Referencing **Section 3.8** and **Appendix A** of ARCHITECTURE.md, finalize the project infrastructure:
>
> 1. **GitHub Actions workflow:** Create `.github/workflows/ci.yml` using the exact configuration from Section 3.8. It must run on push to `main` and `develop` and on PRs to `main`. Steps in order: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm test --run` → `pnpm build`. Add the Supabase environment variable secrets to the build step as shown in Section 3.8.
>
> 2. **Health check route:** Create `app/api/health/route.ts`. This GET handler returns:
>    ```json
>    { \"status\": \"ok\", \"timestamp\": \"<ISO datetime>\", \"version\": \"1.0.0\" }
>    ```
>    No authentication required. This is used by Vercel and monitoring tools to confirm the deployment is alive.
>
> 3. **Vitest configuration:** Create `vitest.config.ts` and at minimum two unit tests:
>    - Test that `validateFileUpload` correctly rejects a file over 10MB.
>    - Test that `buildWhatsAppMessage` returns a payload with the correct `to` number and `messaging_product: 'whatsapp'`.
>
> Stop and wait for my review."

---

### Phase 10 Verification Checklist

- [ ] `pnpm test --run` passes both unit tests
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors
- [ ] `GET /api/health` returns `{ status: 'ok' }` with HTTP 200
- [ ] Push to a branch triggers the GitHub Actions workflow
- [ ] CI pipeline passes all steps on GitHub

**Git commit: `feat: CI pipeline, health check route, unit tests`**

---

---

## Final Pre-Launch Checklist

Before you point the domain at production, go through every item here.

**Environment & Config**
- [ ] All `.env.local` placeholder values replaced with real credentials in Vercel dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel as a **server-only** environment variable (not prefixed with `NEXT_PUBLIC_`)
- [ ] `META_WA_ACCESS_TOKEN` is a permanent system user token, not a temporary page token

**Database**
- [ ] All 4 migration files applied to the production Supabase project via `supabase db push`
- [ ] The 4 division seed rows exist in the `divisions` table
- [ ] At least one `staff_members` row exists for each division with a valid `whatsapp_phone` in E.164 format
- [ ] RLS is enabled on `inquiries`, `staff_members`, and `products` (verify in Supabase dashboard → Auth → Policies)

**WhatsApp**
- [ ] Test inquiry received on the correct WhatsApp number
- [ ] Review Section 2.5 note on Meta template approval before going live with real customers — free-form messages may be blocked for initial contacts

**Security**
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is never used in any client-facing component
- [ ] Confirm no admin API routes are accessible without a valid session (test with a fresh incognito window)
- [ ] Confirm the tracking page API does not return internal fields (curl the endpoint and inspect the response)

**Performance**
- [ ] Lighthouse score on homepage ≥ 90
- [ ] All Next/Image components have correct `width`, `height`, and `alt` attributes
- [ ] No console errors on any public page

---

---

## Correction Scripts — Keep These Ready

These are ready-to-paste prompts for the mistakes Antigravity is most likely to make on this specific project. Copy and paste them verbatim when the issue occurs.

---

**CORRECTION A — Agent built client auth for the quote builder:**
> "CRITICAL STOP. Refer to Part 1 of ARCHITECTURE.md. There is **NO client-side authentication** on the public-facing site. The quote builder is open to any guest. Delete any login flow, session check, or NextAuth code you added to the public routes. The guest is identified only by the `tracking_uuid` generated server-side at submission time. Revert and continue from where you went wrong."

---

**CORRECTION B — Agent used a wrong component name:**
> "Stop. The component name you used does not exist in ARCHITECTURE.md. Open ARCHITECTURE.md and find the exact component name specified for this section. Rename your file and all imports to match it exactly. We do not deviate from the architecture's naming."

---

**CORRECTION C — Agent skipped the `inquiry_events` table:**
> "You are missing the audit trail. Refer to the `inquiry_events` table in Section 2.1. Every status change must insert a row into this table with `event_type: 'status_changed'`, the `actor_id` of the staff member who made the change, and a `payload` of `{ from: previousStatus, to: newStatus }`. Add this INSERT to the PATCH handler."

---

**CORRECTION D — Agent is letting RLS bypass happen via the service role client on public routes:**
> "Stop. The service role client bypasses RLS entirely. It must **only** be used in server-side API routes that handle trusted server-to-server operations (inquiry INSERT, WhatsApp dispatch). All data fetching in division pages and the tracking page must use the server Supabase client that respects RLS — `createServerComponentClient`. Fix this immediately."

---

**CORRECTION E — Agent hardcoded colors instead of using Tailwind tokens:**
> "Do not hardcode hex values. Every color in this project must come from the brand token system in `tailwind.config.ts`. Replace all hardcoded hex values with the correct `brand-*` Tailwind class. Refer to Section 1.1 for the token names."

---

**CORRECTION F — Agent built the admin ticket view as a Kanban board:**
> "The admin ticket view is not a Kanban board. Refer to Section 1.6. It is a sortable data table: `TicketTable.tsx` containing `TicketTableRow.tsx` components. Status changes happen via the `TicketStatusUpdater` dropdown in the ticket detail view, not by dragging cards. Remove the Kanban implementation and replace with the table structure specified."

---

*End of Pro Deal Industries Agent Build Guide v2.0*  
*Align every build decision to ARCHITECTURE.md. When in doubt, read the architecture before you correct the agent.*