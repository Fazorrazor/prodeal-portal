---
trigger: always_on
---

# Division-Aware Thinking

The portal serves 4 divisions. They are NOT interchangeable. Every
component, form field, API handler, and WhatsApp message must be
aware of which division it serves.

Before generating any division-specific code, identify the division
type and apply the rules for it below.

---

## 3D SIGNAGES — Type: Project-Based

Client profile: Business owners, marketing managers, contractors.
They need custom fabricated signage and have artwork or rough ideas.

Key rules:
- The inquiry form MUST include a file upload zone for artwork (AI, PDF, PNG)
- Required fields: sign type, width, height, quantity, material preference
- Optional but valuable: deadline date, reference images
- The WhatsApp message to staff MUST mention file attachment count
- Gallery images load from Supabase Storage 'gallery' bucket via ISR
- Turnaround time questions are the #1 FAQ — surface this prominently

---

## SOUVENIRS & PRINTING — Type: Order-Based

Client profile: Event planners, HR departments, schools, corporates.
They have a specific product in mind and need quantities + customization.

Key rules:
- Clients browse a product catalog before entering the Quote Builder
- Required fields: product type, quantity, whether they have artwork ready
- The MOQ (minimum order quantity) should be visible on every product card
- High inquiry volume expected — the rate limiter is especially important here
- Print spec fields: single/double/all-over print sides

---

## DISPOSABLE BOWLS — Type: Inventory-Based

Client profile: Caterers, restaurants, event companies, retailers.
They care about stock availability, sizes, and bulk pricing.

Key rules:
- The InventoryTable is a Server Component pulling live Supabase data
- Stock status badge is CRITICAL UX: In Stock (green), Low Stock (amber),
  Out of Stock (red, disable the quote CTA for that SKU)
- ENFORCE minimum order quantity (MOQ) at the form validation level —
  a Zod refinement should reject quantities below the product's MOQ
- revalidate = 300 for this page — inventory data must be relatively fresh
- Delivery address is a required field for this division only

---

## CHEMICALS — Type: Technical/Compliance-Based

Client profile: Manufacturers, laboratories, industrial processors.
This is the most regulated division. Treat it accordingly.

Key rules:
- "Intended Use" field is REQUIRED — minimum 10 characters — this is for
  legal compliance, not optional detail
- SDS (Safety Data Sheet) downloads must use Supabase SIGNED URLs with
  expiry — never direct public bucket links for hazmat documentation
- CAS number field is optional but should be clearly labeled
- Grade selector is required: industrial / laboratory / food / pharmaceutical
- The SafetyNotice banner must appear at the TOP of the chemical catalog,
  above all product listings — never remove or hide it
- Do not style chemicals like a consumer product catalog. The tone is
  technical, precise, and compliance-aware.
- Never treat the chemicals division identically to souvenirs/printing.
  The inquiry stakes and compliance requirements are fundamentally different.

---

## Agent Behavior: Division Checks

When a task is ambiguous about which division it affects, ask before
building. When it is clearly division-specific, state which division you
are targeting in your planning step before writing code.

When generating the WhatsApp message payload in buildMessage.ts, always
include the division emoji and division-specific field summary. A generic
message that does not surface the key division fields (e.g., missing
dimensions for signage or missing CAS number for chemicals) is wrong.