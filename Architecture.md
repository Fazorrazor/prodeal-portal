# Pro Deal Industries — Master Build Guide
### Multi-Division Industrial Web Portal · Master Blueprint v1.0

> **Prepared for:** Pro Deal Industries Development Team  
> **Stack:** Next.js 14 (App Router) · Tailwind CSS · Zustand · Supabase · Vercel  
> **Classification:** Internal Developer Reference — Do Not Distribute Publicly

---

## Table of Contents

1. [Component Architecture Guide](#1-component-architecture-guide)
2. [Tech Stack & Backend Handshake](#2-tech-stack--backend-handshake)
3. [Infrastructure, Security & Scaling](#3-infrastructure-security--scaling)
4. [UI/UX AI Generation Prompts](#4-uiux-ai-generation-prompts)
5. [Logo Design Brief](#5-logo-design-brief)

---

---

# 1. Component Architecture Guide

## 1.1 Design System Primitives

All shared design tokens live in `tailwind.config.ts`. Never hardcode colors.

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        'deep-blue': '#0A1628',   // Primary backgrounds, navbars
        'blue':      '#1A56DB',   // CTAs, links, active states
        'red':       '#E02424',   // Alerts, badges, destructive actions
        'blue-muted':'#3B5998',   // Secondary interactive elements
        'surface':   '#F3F6FB',   // Page backgrounds
        'border':    '#CBD5E1',   // Dividers, card borders
      }
    },
    fontFamily: {
      display: ['Bebas Neue', 'sans-serif'],  // Hero headings
      heading: ['DM Sans', 'sans-serif'],     // Section titles
      body:    ['IBM Plex Sans', 'sans-serif'] // Body text, forms
    }
  }
}
```

---

## 1.2 Global Layout Tree

```
app/
├── layout.tsx                        ← RootLayout (HTML shell, font injection, Zustand Provider)
│   ├── components/layout/
│   │   ├── Navbar.tsx                ← Top nav: logo, division nav links, mobile hamburger
│   │   │   ├── NavLogo.tsx
│   │   │   ├── NavLinks.tsx          ← Divisions as anchor links or /division/[slug]
│   │   │   └── MobileDrawer.tsx      ← Sheet-style slide-in nav for mobile
│   │   ├── Footer.tsx                ← Links, social, address, ISO badges
│   │   │   ├── FooterBrand.tsx
│   │   │   ├── FooterLinks.tsx
│   │   │   └── FooterLegal.tsx
│   │   └── ThemeRegistry.tsx         ← (if needed) global CSS variable injection
│   └── providers/
│       ├── ZustandProvider.tsx       ← Wraps app in Zustand store hydration guard
│       └── ToastProvider.tsx         ← Sonner toast context

```

### 1.2.1 Navbar Specification

| State | Behavior |
|---|---|
| Desktop (≥1024px) | Horizontal links: Home · 3D Signages · Souvenirs & Printing · Disposable Bowls · Chemicals · Contact |
| Mobile (<1024px) | Hamburger → `MobileDrawer` (right slide-in sheet, `framer-motion`) |
| Scroll >80px | Navbar gains `backdrop-blur-md bg-brand-deep-blue/90 shadow-xl` transition |
| Active division | Underline indicator in `brand-blue`, bold weight |

---

## 1.3 Homepage Component Tree

```
app/(public)/page.tsx                 ← HomePage (async Server Component, ISR 3600s)
├── sections/
│   ├── HeroSection.tsx               ← Full-viewport industrial hero, CTA to divisions
│   │   ├── HeroBackground.tsx        ← Next/Image with priority, blur placeholder
│   │   ├── HeroHeadline.tsx          ← Animated headline (framer staggerChildren)
│   │   └── HeroCTAGroup.tsx          ← Primary + secondary CTA buttons
│   ├── DivisionsGrid.tsx             ← 4-column card grid linking to division pages
│   │   └── DivisionCard.tsx          ← (×4) Card with icon, title, short descriptor, CTA
│   │       ├── DivisionCardSkeleton.tsx  ← Pulse skeleton, same dimensions
│   │       └── ErrorBoundary.tsx         ← Per-card error state (icon + retry)
│   ├── WhyChooseUs.tsx               ← 3-column feature highlight (icons, text)
│   ├── ProcessTimeline.tsx           ← Horizontal scroll timeline (mobile: vertical)
│   ├── TestimonialsCarousel.tsx      ← Static testimonials (no CMS, hardcoded data)
│   └── ContactBannerCTA.tsx          ← Full-width red banner, WhatsApp direct link

```

---

## 1.4 Division Pages Component Tree

All division pages share a `DivisionLayout` wrapper. The internal content component varies by division type.

```
app/(public)/divisions/
├── [slug]/
│   └── page.tsx                      ← Dynamic route, generateStaticParams for 4 divisions

components/division/
├── DivisionLayout.tsx                ← Wraps all division pages (hero banner + content slot)
│   ├── DivisionHero.tsx              ← Division-specific hero with name, tagline, breadcrumb
│   └── DivisionContent.tsx           ← {children} slot

── 3d-signages/
│   ├── SignageGallery.tsx             ← Masonry grid of past project images (Supabase Storage)
│   │   ├── GalleryImage.tsx           ← Next/Image + lightbox trigger
│   │   └── GallerySkeleton.tsx        ← Shimmer grid placeholders
│   ├── ProjectFAQ.tsx                 ← Accordion: turnaround, materials, design process
│   └── SignageQuoteCTA.tsx            ← Prominent CTA → Quote Builder

── souvenirs-printing/
│   ├── ProductCatalog.tsx             ← Grid of product cards (mugs, tees, trophies, etc.)
│   │   ├── ProductCard.tsx            ← Image, name, min-order, price range badge
│   │   └── ProductCardSkeleton.tsx
│   ├── ProductFilters.tsx             ← Category filter pills (client component)
│   └── PrintingOrderCTA.tsx

── disposable-bowls/
│   ├── InventoryTable.tsx             ← Server component: SKU, size, material, MOQ, stock badge
│   │   ├── StockBadge.tsx             ← "In Stock" (green) / "Low Stock" (amber) / "Out" (red)
│   │   └── InventoryTableSkeleton.tsx ← Table row shimmer placeholders (5 rows)
│   ├── BulkOrderNote.tsx              ← Info callout: MOQ policy, lead times
│   └── BowlsOrderCTA.tsx

── chemicals/
│   ├── ChemicalCatalog.tsx            ← Card grid with search + filter by category
│   │   ├── ChemicalCard.tsx           ← Name, CAS number, grade, SDS download button
│   │   ├── ChemicalCardSkeleton.tsx
│   │   └── SDSDownloadButton.tsx      ← Triggers Supabase Storage signed URL
│   ├── ChemicalSearchBar.tsx          ← Debounced client-side search (Zustand slice)
│   ├── ChemicalFilters.tsx            ← Filter by: Industrial / Lab / Specialty
│   ├── SafetyNotice.tsx               ← Regulatory callout banner (red-bordered)
│   └── ChemicalInquiryCTA.tsx

```

---

## 1.5 Quote Builder Component Tree

The Quote Builder is a **multi-step modal** (not a separate page) triggered by any division CTA. It is a **Client Component** with Zustand managing state across steps.

```
components/quote-builder/
├── QuoteBuilderModal.tsx              ← Modal shell: backdrop, close, step progress bar
│   ├── QuoteStepIndicator.tsx         ← Step 1/2/3 pill progress indicator
│   ├── steps/
│   │   ├── Step1_DivisionConfirm.tsx  ← "You're inquiring about: [Division]" + edit option
│   │   ├── Step2_ContactDetails.tsx   ← Name*, Email*, Phone* (WhatsApp preferred), Company
│   │   │   └── PhoneInput.tsx         ← react-phone-number-input with GH (+233) default
│   │   ├── Step3_InquiryDetails.tsx   ← Dynamic per division:
│   │   │   ├── SignageInquiryFields.tsx    ← Size, Qty, Material pref, artwork upload
│   │   │   ├── PrintingInquiryFields.tsx  ← Product type, Qty, custom artwork upload
│   │   │   ├── BowlsInquiryFields.tsx     ← SKU picker (from inventory), Qty, delivery date
│   │   │   └── ChemicalInquiryFields.tsx  ← Product name, quantity, grade, intended use
│   │   └── Step4_ReviewSubmit.tsx     ← Summary card, terms checkbox, Submit button
│   ├── FileUploadZone.tsx             ← Drag-and-drop (react-dropzone), 10MB max, types enforced
│   │   ├── FilePreview.tsx            ← Thumbnail for images, icon for PDFs
│   │   └── UploadProgress.tsx         ← Animated progress bar during Supabase upload
│   └── SubmissionSuccess.tsx          ← Tracking UUID display + copy button + WhatsApp CTA

store/
└── quoteStore.ts                      ← Zustand: division, step, formData, files, trackingId

```

### 1.5.1 Quote Builder State Machine (Zustand)

```ts
// store/quoteStore.ts
interface QuoteState {
  isOpen: boolean;
  division: 'signages' | 'printing' | 'bowls' | 'chemicals' | null;
  currentStep: 1 | 2 | 3 | 4;
  contactDetails: ContactDetailsSchema | null;
  inquiryDetails: Record<string, unknown> | null;
  uploadedFiles: UploadedFile[];
  trackingId: string | null;
  isSubmitting: boolean;
  submitError: string | null;

  // Actions
  openBuilder: (division: QuoteState['division']) => void;
  closeBuilder: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setContactDetails: (data: ContactDetailsSchema) => void;
  setInquiryDetails: (data: Record<string, unknown>) => void;
  addFile: (file: UploadedFile) => void;
  removeFile: (fileId: string) => void;
  setTrackingId: (id: string) => void;
  reset: () => void;
}
```

---

## 1.6 Admin Dashboard Component Tree

> All components under `/admin` are **fully protected** — middleware enforces Supabase Auth JWT on every request to `/admin/*`.

```
app/admin/
├── layout.tsx                         ← AdminLayout: sidebar + topbar shell
│   ├── components/admin/
│   │   ├── AdminSidebar.tsx           ← Nav: Dashboard, Tickets, Staff, Settings, Logout
│   │   ├── AdminTopbar.tsx            ← Current user badge, notification bell, global search
│   │   └── AdminAuthGuard.tsx         ← Server-side session check; redirect to /admin/login if invalid

├── login/page.tsx                     ← Minimal login form (email/password → Supabase Auth)
│   └── AdminLoginForm.tsx

├── page.tsx                           ← Dashboard overview (metrics cards, recent tickets)
│   ├── MetricsRow.tsx                 ← Total tickets, pending, resolved, avg. response time
│   │   └── MetricCard.tsx             ← (×4) Animated count-up numbers
│   └── RecentTicketsTable.tsx         ← Last 20 tickets, sortable, paginated

├── tickets/
│   ├── page.tsx                       ← Ticket list: filterable by division, status, date
│   │   ├── TicketFilters.tsx          ← Division pills + Status dropdown + DateRange picker
│   │   ├── TicketTable.tsx            ← Sortable table: ID, Division, Name, Status, Date, Actions
│   │   │   └── TicketTableRow.tsx     ← Status badge color-coded per division
│   │   └── TicketTableSkeleton.tsx    ← 10-row shimmer loader
│   └── [id]/page.tsx                  ← Ticket detail view
│       ├── TicketDetailHeader.tsx     ← Tracking ID, division badge, submitted timestamp
│       ├── TicketContactCard.tsx      ← Name, email, phone (click-to-WhatsApp)
│       ├── TicketInquiryDetails.tsx   ← Dynamic: renders division-specific fields
│       ├── TicketFileAttachments.tsx  ← Signed URL links with file type icons
│       ├── TicketStatusUpdater.tsx    ← Dropdown: New → In Progress → Quoted → Closed
│       ├── TicketNotes.tsx            ← Internal staff notes textarea (not visible to guest)
│       └── TicketResendWhatsApp.tsx   ← "Resend to WhatsApp" button (rate-limited)

├── staff/
│   ├── page.tsx                       ← Staff list per division
│   └── StaffAssignmentTable.tsx       ← Division → Staff member mapping table

└── settings/page.tsx                  ← WhatsApp config, division settings

```

---

## 1.7 Error Boundary Strategy

```tsx
// components/shared/DivisionErrorBoundary.tsx
// Wrap every async Server Component data-fetch block with this.
// Shows branded "Something went wrong" with retry button.

'use client';
import { Component } from 'react';

export class DivisionErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center gap-3 p-8 border border-brand-red/30 rounded-xl bg-brand-red/5">
          <span className="text-brand-red font-heading font-semibold">
            Failed to load section
          </span>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm text-brand-blue underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

---

# 2. Tech Stack & Backend Handshake

## 2.1 Database Schema (PostgreSQL via Supabase)

### Table: `divisions`

```sql
CREATE TABLE divisions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,          -- 'signages' | 'printing' | 'bowls' | 'chemicals'
  display_name TEXT NOT NULL,
  type         TEXT NOT NULL,                 -- 'project' | 'order' | 'inventory' | 'technical'
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Seed data
INSERT INTO divisions (slug, display_name, type) VALUES
  ('signages',  '3D Signages',            'project'),
  ('printing',  'Souvenirs & Printing',   'order'),
  ('bowls',     'Disposable Bowls',       'inventory'),
  ('chemicals', 'Chemicals',              'technical');
```

### Table: `staff_members`

```sql
CREATE TABLE staff_members (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  whatsapp_phone TEXT NOT NULL,               -- E.164 format: +233XXXXXXXXX
  division_id    uuid REFERENCES divisions(id),
  role           TEXT DEFAULT 'agent',        -- 'agent' | 'manager' | 'admin'
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

### Table: `inquiries` (Central Ticket Table)

```sql
CREATE TABLE inquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_uuid   TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  division_id     uuid REFERENCES divisions(id) NOT NULL,
  assigned_staff  uuid REFERENCES staff_members(id),

  -- Contact Info (no auth required)
  contact_name    TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT NOT NULL,
  company_name    TEXT,

  -- Flexible inquiry payload per division
  inquiry_payload JSONB NOT NULL DEFAULT '{}',

  -- File metadata (actual files stored in Supabase Storage)
  attachments     JSONB DEFAULT '[]',         -- [{name, url, size, mimeType}]

  -- Workflow
  status          TEXT NOT NULL DEFAULT 'new',
    -- 'new' | 'in_progress' | 'quoted' | 'closed' | 'cancelled'
  internal_notes  TEXT,
  wa_sent_at      TIMESTAMPTZ,                -- Timestamp of WhatsApp dispatch
  wa_message_id   TEXT,                       -- Meta API message ID for status tracking

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inquiries_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_inquiries_division    ON inquiries(division_id);
CREATE INDEX idx_inquiries_status      ON inquiries(status);
CREATE INDEX idx_inquiries_tracking    ON inquiries(tracking_uuid);
CREATE INDEX idx_inquiries_created_at  ON inquiries(created_at DESC);
```

### Table: `inquiry_events` (Audit Trail)

```sql
CREATE TABLE inquiry_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id   uuid REFERENCES inquiries(id) ON DELETE CASCADE,
  actor_id     uuid,                           -- NULL = system | UUID = staff member
  event_type   TEXT NOT NULL,                  -- 'created' | 'status_changed' | 'wa_sent' | 'note_added'
  payload      JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

### Table: `products` (Shared catalog, per-division)

```sql
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id   uuid REFERENCES divisions(id) NOT NULL,
  sku           TEXT,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  metadata      JSONB DEFAULT '{}',            -- Division-specific: {cas_number, grade, moq, unit}
  image_path    TEXT,                          -- Supabase Storage path
  is_active     BOOLEAN DEFAULT true,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 2.2 Supabase Storage Buckets

| Bucket Name | Access | Purpose |
|---|---|---|
| `inquiry-attachments` | Private (RLS-protected) | Guest-uploaded artwork, spec files |
| `product-images` | Public | Division product/catalog images |
| `sds-documents` | Public | Chemical Safety Data Sheets (PDFs) |
| `gallery` | Public | 3D Signage project portfolio images |

---

## 2.3 API Route Handlers (`app/api/`)

```
app/api/
├── inquiries/
│   ├── route.ts               POST /api/inquiries        ← Create new inquiry + trigger WhatsApp
│   └── [trackingId]/
│       └── route.ts           GET  /api/inquiries/[id]   ← Guest tracking lookup (public)
├── upload/
│   └── route.ts               POST /api/upload           ← Presigned URL generator for Supabase Storage
├── whatsapp/
│   └── route.ts               POST /api/whatsapp         ← Internal: dispatch WA message via Meta API
├── admin/
│   ├── inquiries/
│   │   ├── route.ts           GET  /api/admin/inquiries  ← List tickets (authenticated)
│   │   └── [id]/
│   │       └── route.ts       PATCH /api/admin/inquiries/[id] ← Update status/notes
│   └── staff/
│       └── route.ts           GET/POST /api/admin/staff  ← Staff management
└── health/
    └── route.ts               GET  /api/health           ← Uptime probe for Vercel
```

---

## 2.4 Complete Data Flow Handshake

### Flow A — Guest Inquiry Submission (Happy Path)

```
STEP 1: Client opens QuoteBuilderModal
        → Zustand: openBuilder(division)
        → QuoteStepIndicator renders Step 1

STEP 2: Guest fills Steps 1–3 in the modal
        → Zustand accumulates: contactDetails, inquiryDetails

STEP 3 (conditional): Guest uploads artwork/spec file
        → FileUploadZone triggers POST /api/upload
        → Server validates: mimeType ∈ allowedTypes, size ≤ 10MB (enforced server-side)
        → Server calls supabase.storage.createSignedUploadUrl('inquiry-attachments', path)
        → Client uploads directly to Supabase Storage via returned presigned URL
        → On success: Zustand.addFile({ name, url, size, mimeType })

STEP 4: Guest reaches Step 4 (Review), checks terms, clicks "Submit Inquiry"
        → Client calls POST /api/inquiries with full payload

STEP 5: POST /api/inquiries handler (server-side)
        a) Zod validates full payload (ContactDetailsSchema + DivisionInquirySchema)
        b) Check Upstash Redis rate limit: ip:{ip}:submit → max 3 per hour
        c) Query DB: SELECT * FROM staff_members WHERE division_id = ? AND is_active = true LIMIT 1
        d) INSERT into inquiries table → get back tracking_uuid
        e) INSERT into inquiry_events (type: 'created')
        f) Call internal POST /api/whatsapp (or invoke WhatsApp function directly)
           → Check Upstash Redis rate limit: wa:division:{divId} → max 60/hr (Meta API limit)
           → Build formatted WhatsApp message markdown template
           → POST to https://graph.facebook.com/v19.0/{phone_id}/messages
           → On success: UPDATE inquiries SET wa_sent_at, wa_message_id
        g) Return { success: true, trackingId: tracking_uuid }

STEP 6: QuoteBuilderModal transitions to SubmissionSuccess
        → Displays tracking UUID with copy button
        → Displays "Track your inquiry" link → /track/[trackingId]
        → Displays "Message us on WhatsApp" direct link (optional)
```

### Flow B — Guest Inquiry Tracking

```
STEP 1: Guest visits /track/[trackingId]
        → page.tsx calls GET /api/inquiries/[trackingId]

STEP 2: API handler:
        a) SELECT id, status, division_id, created_at, updated_at
           FROM inquiries WHERE tracking_uuid = $1
           (Intentionally omits internal_notes, assigned_staff, wa_message_id from response)
        b) Return sanitized public-safe payload

STEP 3: Page renders status timeline:
        new → in_progress → quoted → closed
        Current status highlighted in brand-blue.
```

### Flow C — Admin Ticket Management

```
STEP 1: Staff navigates to /admin/tickets
        → Next.js middleware verifies Supabase JWT cookie
        → If invalid/missing → redirect('/admin/login')

STEP 2: AdminTicketTable loads via GET /api/admin/inquiries
        → Server reads auth session: const { data: { user } } = await supabase.auth.getUser()
        → Applies RLS: staff can only view inquiries for their division
        → Manager/admin role can view all divisions

STEP 3: Staff clicks ticket → /admin/tickets/[id]
        → Full ticket detail loaded including internal_notes, attachments (signed URLs)

STEP 4: Staff updates status via TicketStatusUpdater
        → PATCH /api/admin/inquiries/[id] { status: 'in_progress' }
        → Server validates auth + role
        → UPDATE inquiries SET status = $1
        → INSERT inquiry_events (type: 'status_changed', actor_id: staffId)

STEP 5: (Optional) Staff clicks "Resend to WhatsApp"
        → POST /api/whatsapp { inquiryId }
        → Rate limit checked (Upstash Redis)
        → Re-dispatches formatted message
```

---

## 2.5 WhatsApp Message Template (Meta API)

WhatsApp Business API requires pre-approved message templates for outbound messages. Use the following template format:

```ts
// lib/whatsapp/buildMessage.ts

export function buildWhatsAppMessage(inquiry: InquiryRow, division: DivisionRow): WhatsAppPayload {
  const divisionEmoji: Record<string, string> = {
    signages:  '🏗️',
    printing:  '🖨️',
    bowls:     '📦',
    chemicals: '⚗️',
  };

  const lines = [
    `*🔔 NEW INQUIRY — Pro Deal Industries*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*Division:* ${divisionEmoji[division.slug]} ${division.display_name}`,
    `*Tracking ID:* \`${inquiry.tracking_uuid}\``,
    `*Date:* ${new Date(inquiry.created_at).toLocaleString('en-GH')}`,
    ``,
    `*📋 CONTACT DETAILS*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*Name:* ${inquiry.contact_name}`,
    `*Email:* ${inquiry.contact_email}`,
    `*Phone:* ${inquiry.contact_phone}`,
    ...(inquiry.company_name ? [`*Company:* ${inquiry.company_name}`] : []),
    ``,
    `*📝 INQUIRY DETAILS*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ...formatDivisionPayload(inquiry.inquiry_payload, division.slug),
    ``,
    ...(inquiry.attachments.length > 0
      ? [`*📎 ATTACHMENTS:* ${inquiry.attachments.length} file(s) attached`]
      : []),
    ``,
    `*👉 View in Admin:* https://prodealindustries.com/admin/tickets/${inquiry.id}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `_Sent by Pro Deal Portal System_`,
  ];

  return {
    messaging_product: 'whatsapp',
    to: inquiry.assigned_staff.whatsapp_phone,  // E.164
    type: 'text',
    text: { body: lines.join('\n') },
  };
}
```

> **Note:** For production, convert to an approved Meta template (template messages have higher delivery rates and work for initial contacts). Use interactive templates for quick reply buttons ("Reply ACCEPT to confirm").

---

---

# 3. Infrastructure, Security & Scaling

## 3.1 Zod Validation Schemas

All API inputs are validated with Zod **before** any database operation. Reject at the edge.

```ts
// lib/validators/inquiry.ts
import { z } from 'zod';

export const ContactDetailsSchema = z.object({
  name:        z.string().min(2).max(100),
  email:       z.string().email(),
  phone:       z.string().regex(/^\+[1-9]\d{6,14}$/, 'Must be E.164 format'),
  companyName: z.string().max(150).optional(),
});

// --- Division-Specific Schemas ---

export const SignageInquirySchema = z.object({
  signType:     z.enum(['3d_lettering', 'lightbox', 'standee', 'vehicle_wrap', 'other']),
  width:        z.number().positive().max(10000),   // mm
  height:       z.number().positive().max(10000),   // mm
  quantity:     z.number().int().min(1).max(500),
  materialPref: z.string().max(200).optional(),
  deadline:     z.string().datetime().optional(),
  notes:        z.string().max(1000).optional(),
});

export const PrintingInquirySchema = z.object({
  productType:  z.string().min(2).max(100),
  quantity:     z.number().int().min(1).max(10000),
  hasArtwork:   z.boolean(),
  printSides:   z.enum(['single', 'double', 'all_over']).optional(),
  notes:        z.string().max(1000).optional(),
});

export const BowlsInquirySchema = z.object({
  productSku:   z.string().min(2).max(50),
  quantity:     z.number().int().min(100),          // Enforce MOQ
  deliveryDate: z.string().datetime().optional(),
  deliveryAddr: z.string().max(300),
  notes:        z.string().max(500).optional(),
});

export const ChemicalInquirySchema = z.object({
  productName:  z.string().min(2).max(200),
  casNumber:    z.string().regex(/^\d{2,7}-\d{2}-\d$/).optional(),
  grade:        z.enum(['industrial', 'lab', 'food', 'pharmaceutical']),
  quantityKg:   z.number().positive(),
  intendedUse:  z.string().min(10).max(500),        // Required for compliance
  hasHazmatExp: z.boolean(),
  notes:        z.string().max(500).optional(),
});

export const DIVISION_SCHEMAS = {
  signages:  SignageInquirySchema,
  printing:  PrintingInquirySchema,
  bowls:     BowlsInquirySchema,
  chemicals: ChemicalInquirySchema,
} as const;

// Full submission schema
export const InquirySubmissionSchema = z.object({
  divisionSlug: z.enum(['signages', 'printing', 'bowls', 'chemicals']),
  contact:      ContactDetailsSchema,
  inquiry:      z.record(z.unknown()),              // Validated against DIVISION_SCHEMAS[divisionSlug] dynamically
  fileIds:      z.array(z.string().uuid()).max(5),
});
```

---

## 3.2 File Upload Security

```ts
// lib/upload/validateFile.ts

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/illustrator',
  'application/postscript',        // .ai, .eps
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;    // 10 MB hard ceiling

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` };
  }
  return { valid: true };
}

// IMPORTANT: Also enforce on the server in /api/upload/route.ts
// Client-side validation is UX only — server-side is the security gate.
// Supabase Storage policies also enforce MIME type restrictions:
//
// Supabase Storage Policy (SQL):
// CREATE POLICY "Restrict upload types" ON storage.objects
//   FOR INSERT TO anon
//   WITH CHECK (
//     bucket_id = 'inquiry-attachments'
//     AND (metadata->>'mimetype') IN (
//       'image/jpeg', 'image/png', 'image/webp', 'application/pdf'
//     )
//     AND (metadata->>'size')::int < 10485760
//   );
```

---

## 3.3 Row Level Security (RLS) Rules

```sql
-- =========================================
-- INQUIRIES TABLE
-- =========================================

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Anon (guest): INSERT only (submitting inquiry)
CREATE POLICY "guest_insert_inquiry" ON inquiries
  FOR INSERT TO anon
  WITH CHECK (true);

-- Anon (guest): SELECT own inquiry by tracking_uuid only
-- (API handler applies this filter; RLS provides defense-in-depth)
CREATE POLICY "guest_select_own_inquiry" ON inquiries
  FOR SELECT TO anon
  USING (true);                        -- Filtered by API via .eq('tracking_uuid', id)

-- Authenticated staff: SELECT their division's inquiries
CREATE POLICY "staff_select_own_division" ON inquiries
  FOR SELECT TO authenticated
  USING (
    division_id = (
      SELECT division_id FROM staff_members
      WHERE auth_user_id = auth.uid()
    )
  );

-- Admin role: SELECT all inquiries
CREATE POLICY "admin_select_all" ON inquiries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Staff: UPDATE only their division's inquiries (status, notes)
CREATE POLICY "staff_update_own_division" ON inquiries
  FOR UPDATE TO authenticated
  USING (
    division_id = (
      SELECT division_id FROM staff_members
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (true);

-- =========================================
-- STAFF_MEMBERS TABLE
-- =========================================

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Staff: can see own record
CREATE POLICY "staff_select_self" ON staff_members
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- Admin: full access
CREATE POLICY "admin_all_staff" ON staff_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members s2
      WHERE s2.auth_user_id = auth.uid() AND s2.role = 'admin'
    )
  );

-- =========================================
-- PRODUCTS TABLE
-- =========================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_products" ON products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Only admin can write
CREATE POLICY "admin_write_products" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 3.4 Rate Limiting with Upstash Redis

```ts
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const inquiryRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),    // 3 submissions per IP per hour
  prefix: 'rl:inquiry',
});

export const whatsappRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 h'),   // 60 WA messages per division per hour
  prefix: 'rl:whatsapp',
});

export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),   // 20 uploads per IP per hour
  prefix: 'rl:upload',
});

// Usage in route handler:
// const { success, limit, remaining } = await inquiryRateLimit.limit(clientIp);
// if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
```

---

## 3.5 Next.js Middleware (Route Protection)

```ts
// middleware.ts (project root)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Only run auth logic on /admin routes (public routes are completely unaffected)
  if (req.nextUrl.pathname.startsWith('/admin')) {

    // Skip auth check on the login page itself
    if (req.nextUrl.pathname === '/admin/login') return res;

    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

---

## 3.6 Caching & ISR Strategy

| Route | Strategy | Revalidation |
|---|---|---|
| `/` (Homepage) | ISR | `revalidate: 3600` (1 hour) |
| `/divisions/[slug]` | ISR | `revalidate: 1800` (30 min) |
| `/divisions/bowls` | ISR | `revalidate: 300` (5 min — inventory changes more often) |
| `/track/[trackingId]` | Dynamic (no cache) | Always fresh — `cache: 'no-store'` |
| `/admin/*` | Dynamic + Auth | Always fresh |
| Static assets (images, CSS, JS) | Vercel CDN Edge | Immutable (content hash in filename) |

```ts
// Example: app/(public)/divisions/[slug]/page.tsx
export const revalidate = 1800;

export async function generateStaticParams() {
  return [
    { slug: 'signages' },
    { slug: 'printing' },
    { slug: 'bowls' },
    { slug: 'chemicals' },
  ];
}
```

---

## 3.7 Environment Variables

```bash
# .env.local (never commit — add to Vercel environment variables)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # Server-only: for admin API routes

# Meta WhatsApp Business API
META_WA_PHONE_NUMBER_ID=1234567890          # Your WA Business phone number ID
META_WA_ACCESS_TOKEN=EAAxxxxx              # Permanent system user token
META_WA_VERIFY_TOKEN=your_webhook_secret   # For webhook verification

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx

# App
NEXT_PUBLIC_APP_URL=https://prodealindustries.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional: Google Analytics
```

---

## 3.8 CI/CD Pipeline (GitHub → Vercel)

```
Developer pushes to GitHub
        │
        ▼
┌─────────────────────────────────────┐
│  GitHub Actions (CI)                 │
│  Trigger: push to main / PR opened  │
│                                     │
│  1. pnpm install --frozen-lockfile  │
│  2. pnpm lint (ESLint)              │
│  3. pnpm typecheck (tsc --noEmit)   │
│  4. pnpm test (Vitest unit tests)   │
│  5. pnpm build (Next.js build check)│
└─────────────┬───────────────────────┘
              │ All checks pass
              ▼
┌─────────────────────────────────────┐
│  Vercel (CD)                        │
│  Auto-deploy on merge to main:      │
│                                     │
│  - Pull Request → Preview Deploy    │
│    URL: prodealindustries-pr-XX.    │
│         vercel.app                  │
│                                     │
│  - main branch → Production Deploy  │
│    URL: prodealindustries.com       │
│                                     │
│  Vercel runs:                       │
│  - next build (Edge-optimized)      │
│  - Generates static pages (SSG)     │
│  - Deploys to global CDN edge       │
└─────────────────────────────────────┘
```

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm typecheck

      - name: Unit Tests
        run: pnpm test --run

      - name: Build Check
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## 3.9 Supabase Database Migrations (Version Control)

```
supabase/
├── migrations/
│   ├── 20240101000000_initial_schema.sql    ← Divisions, staff, inquiries tables
│   ├── 20240101000001_rls_policies.sql      ← All RLS rules
│   ├── 20240101000002_storage_buckets.sql   ← Storage bucket creation + policies
│   └── 20240101000003_seed_divisions.sql    ← Seed the 4 divisions
└── config.toml
```

Use `supabase db push` to apply migrations to production. Never run raw SQL directly against the production database.

---

---

# 4. UI/UX AI Generation Prompts

> These prompts are engineered for **Midjourney v6** and **DALL-E 3**. For Midjourney, append `--ar 16:9 --v 6 --style raw` to all prompts unless otherwise noted.

---

## 4.1 Homepage Hero — Midjourney Prompt

```
Industrial B2B web portal homepage hero section, deep navy blue background (#0A1628), 
large bold white typographic headline "PRO DEAL INDUSTRIES" in a condensed industrial 
sans-serif font, four division cards arranged in a horizontal row below the headline — 
each card has a subtle metallic dark-blue surface with a glowing red accent border on 
hover state, showing icons for: 3D signage with neon letters, printing press with ink 
rolls, stacked disposable bowls, and chemical flask — the layout is clean, modern, 
corporate industrial, slight blue gradient mesh overlay on background, small red accent 
lines used as decorative dividers, a prominent CTA button in bright cobalt blue 
(#1A56DB), professional B2B aesthetics, ultra-wide desktop mockup, photorealistic UI 
screenshot, 8K detail, no people, no stock photo backgrounds, flat-to-dimensional 
hybrid design style, inspired by Stripe and IBM design systems but with an industrial 
manufacturing tone --ar 16:9 --v 6 --style raw
```

---

## 4.2 Chemical Catalog Page — Midjourney Prompt

```
Industrial chemical product catalog web page UI mockup, dark deep navy (#0A1628) 
sidebar with filter categories: "Industrial", "Laboratory", "Specialty", "Food Grade" 
— main content area shows a 3-column grid of chemical product cards on a light slate 
background (#F3F6FB) — each card shows: chemical name in bold dark blue typography, 
CAS number in monospace font, a colored grade badge (red for industrial, cobalt blue 
for laboratory), and a "Download SDS" button in outline style — top of page has a 
prominent search bar with a blue active focus glow, a red warning banner at top reads 
"Safety Data Sheets available for all listed chemicals" — typography is technical and 
precise, reminiscent of scientific catalogs — professional B2B UI, desktop browser 
mockup, subtle grid texture on background, small molecular structure watermarks as 
decorative elements in deep blue, ultra high detail, clean modern industrial aesthetic 
--ar 16:9 --v 6 --style raw
```

---

## 4.3 Mobile Guest Quote Builder — Midjourney Prompt

```
Mobile phone screenshot mockup of a multi-step quote request form for an industrial 
B2B company, phone frame is dark, screen shows a clean modal overlay — step 2 of 4 
indicator at top as connected pill dots in cobalt blue (#1A56DB) — white card surface 
with deep navy text — form fields for "Full Name", "WhatsApp Number" (with Ghana 
+233 flag prefix), "Email Address" — each field has a sharp cobalt blue focus border 
— at the bottom a large cobalt blue button "Continue →" — background behind the modal 
shows blurred industrial signage product imagery — top of modal has a small red 
division badge reading "3D SIGNAGES" — progress bar at top is partially filled in 
red (#E02424) showing 50% completion — typography uses a clean geometric sans-serif, 
highly polished consumer mobile UI but with industrial brand identity, iPhone 15 Pro 
frame, realistic screen reflection, soft shadow on modal card --ar 9:16 --v 6 
--style raw
```

---

## 4.4 Admin Dashboard — Midjourney Prompt

```
Admin dashboard UI for an industrial B2B ticket management system, deep navy sidebar 
(#0A1628) on the left with white icons and labels: Dashboard, Tickets, Staff, 
Settings — active state "Tickets" highlighted with a bright cobalt blue (#1A56DB) 
left border and background — main content area shows a data table with inquiry tickets 
— columns: Tracking ID (monospace), Division (color-coded badge: red for signages, 
blue for chemicals, green for bowls, purple for printing), Contact Name, Status 
(pill badges: "New" in red, "In Progress" in amber, "Quoted" in blue, "Closed" in 
gray), Submitted Date, Actions — top row shows 4 metric cards with large bold numbers: 
Total Inquiries, Pending, Resolved Today, Avg Response Time — light background main 
area with subtle card shadows, topbar shows staff member avatar and notification bell 
with red badge — professional enterprise SaaS aesthetic, ultra-wide monitor mockup, 
clean data-dense layout, dark sidebar contrast with light content area, no decorative 
illustrations --ar 16:9 --v 6 --style raw
```

---

## 4.5 DALL-E 3 Variants (Alternative)

### Homepage Hero — DALL-E 3 Prompt
```
A photorealistic UI mockup of a professional B2B industrial company homepage displayed 
in a web browser. The design uses a deep dark navy blue color scheme (#0A1628) with 
cobalt blue accent buttons and red highlights. The hero section features bold condensed 
industrial typography for the company name. Below are four dark metallic product 
division cards with icons representing: custom 3D signage, commercial printing, 
disposable packaging, and industrial chemicals. The overall aesthetic is modern, 
corporate, and trustworthy — similar to high-end B2B SaaS websites. Clean layout, 
no people, photorealistic screen mockup on a MacBook Pro.
```

### Admin Dashboard — DALL-E 3 Prompt
```
A photorealistic UI mockup of an enterprise admin dashboard displayed on a wide monitor. 
The left sidebar is dark navy blue with white navigation icons. The main content area 
shows a ticket management table with colored status badges (red, amber, blue, gray). 
Four KPI metric cards sit at the top with large numbers. The color palette is 
professional: deep navy, cobalt blue, and red accent colors. Typography is clean and 
technical. The interface resembles Linear or Notion in layout density but uses an 
industrial B2B color scheme. No decorative illustrations, realistic screen glare.
```

---

---

# 5. Logo Design Brief

## Pro Deal Industries — Identity Design Brief

**Company Name:** Pro Deal Industries  
**Industry:** Multi-division industrial B2B (Signage, Print, Packaging, Chemicals)  
**Tagline (optional):** *"Built for Industry. Delivered with Precision."*

---

### 5.1 Brand Personality

| Attribute | Descriptor |
|---|---|
| **Tone** | Professional, dependable, no-nonsense |
| **Character** | A factory foreman who runs a tight ship but gets results |
| **Keywords** | Precision, Reliability, Scale, Industry, Delivery |
| **Avoid** | Playful, organic, trendy, startup-ish, overly minimal |

---

### 5.2 Color Palette

| Role | Color | Hex |
|---|---|---|
| Primary (Background use) | Deep Navy Blue | `#0A1628` |
| Secondary (Interactive) | Industrial Blue | `#1A56DB` |
| Accent (Alerts, energy) | Signal Red | `#E02424` |
| Neutral Light | Off-White Steel | `#F3F6FB` |

---

### 5.3 Logo Design Directions (Choose One)

**Direction A — Monogram Mark + Wordmark**  
A bold geometric monogram of the letters **"PDI"** constructed from interlocking angular shapes (evoking industrial metal components or structural beams). The monogram uses deep navy with a red accent. Wordmark "PRO DEAL INDUSTRIES" sits to the right in a condensed industrial sans-serif (e.g., Bebas Neue, Dharma Gothic).

**Direction B — Abstract Factory Icon + Wordmark**  
A simplified icon of a cog, structural beam, or upward-pointing chevron that abstractly represents industrial growth and multi-division output. Icon in signal red, wordmark in deep navy. Works well on both light and dark backgrounds.

**Direction C — Shield/Badge Mark (Recommended)**  
A bold hexagonal or shield badge containing the stylized letters **"PD"** or **"PDI"**, conveying authority and certification. Deep navy fill, cobalt blue border, thin red horizontal rule across the center of the shield. "PRO DEAL" in condensed caps above the rule, "INDUSTRIES" in smaller tracking below. Evokes industrial certification, quality marks, and official B2B authority.

---

### 5.4 Typography Pairing

| Usage | Font | Style |
|---|---|---|
| Logo Wordmark | Bebas Neue | All-caps, condensed, bold |
| Web Headings | DM Sans | Semi-bold, tight tracking |
| Web Body | IBM Plex Sans | Regular/Light, excellent legibility |
| Admin UI Data | IBM Plex Mono | Monospace for IDs, codes, numbers |

---

### 5.5 Logo Usage Rules

1. **Minimum size:** 24px height for digital; 12mm height for print.
2. **Clear space:** Equal to the height of the "P" in "PRO" on all four sides.
3. **Approved backgrounds:** Deep navy blue, white/off-white, light steel gray.
4. **Never:** Stretch, rotate, recolor the red accent to another color, apply drop shadows, place on busy photographic backgrounds without overlay.
5. **Dark variant:** Full white wordmark + white monogram, red accent retained.
6. **Favicon:** Use only the monogram mark (PDI) at 32×32px, no wordmark.

---

### 5.6 Deliverables Required from Designer

- [ ] SVG master file (all variants)
- [ ] PNG exports: 1×, 2×, 3× (transparent background)
- [ ] Dark background variant
- [ ] Favicon (32×32, 192×192, 512×512 PNG)
- [ ] Brand guidelines 1-pager (PDF)
- [ ] WhatsApp profile image (400×400 PNG, centered mark on navy)

---

---

## Appendix A — Project Directory Structure

```
prodeal-portal/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                         ← Homepage
│   │   ├── divisions/[slug]/page.tsx
│   │   └── track/[trackingId]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── tickets/[id]/page.tsx
│   │   ├── staff/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── inquiries/route.ts
│   │   ├── inquiries/[trackingId]/route.ts
│   │   ├── upload/route.ts
│   │   ├── whatsapp/route.ts
│   │   ├── admin/inquiries/route.ts
│   │   ├── admin/inquiries/[id]/route.ts
│   │   └── health/route.ts
│   ├── globals.css
│   └── layout.tsx                           ← Root layout
├── components/
│   ├── layout/                              ← Navbar, Footer, etc.
│   ├── division/                            ← Per-division components
│   ├── quote-builder/                       ← Multi-step quote modal
│   ├── admin/                               ← Admin dashboard components
│   └── shared/                              ← ErrorBoundary, Skeletons, UI primitives
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        ← Browser Supabase client
│   │   └── server.ts                        ← Server-side Supabase client
│   ├── validators/
│   │   └── inquiry.ts                       ← Zod schemas
│   ├── whatsapp/
│   │   └── buildMessage.ts
│   ├── ratelimit.ts
│   └── upload/
│       └── validateFile.ts
├── store/
│   └── quoteStore.ts                        ← Zustand quote builder store
├── supabase/
│   ├── migrations/
│   └── config.toml
├── public/
│   ├── logo.svg
│   └── icons/
├── .github/
│   └── workflows/ci.yml
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Appendix B — Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.43.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "zustand": "^4.5.2",
    "zod": "^3.23.0",
    "react-dropzone": "^14.2.3",
    "react-phone-number-input": "^3.3.9",
    "framer-motion": "^11.1.7",
    "@upstash/ratelimit": "^1.1.3",
    "@upstash/redis": "^1.31.0",
    "sonner": "^1.4.41"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0"
  }
}
```

---

*End of Pro Deal Industries Master Build Guide — v1.0*  
*Generated for internal developer use. All architecture decisions reflect the project constraints as specified. Review Section 2.5 (WhatsApp Template Policy) with Meta Business compliance before going live.*
