# DESIGN SYSTEM

**Purpose:** Serves as the source of truth for the visual language and UI constraints of the Pro Deal Industries platform.

---

## 1. High-End Minimalism (Luxury Aesthetic)

The platform prioritizes clarity, whitespace, and premium visual elegance. We draw inspiration from luxury fashion, high-end skincare, and curated boutique brands (e.g., Apple, Aesop).

### CORE TENET: Effortless Elegance & Whitespace
- **Whitespace is structural:** Use generous padding and margins to let content breathe. Do not cram data together.
- **Subtle Elevation:** Use borderless product cards or extremely subtle, soft shadows to create depth without visual noise.
- **Neutral Palettes:** Rely on a curated, harmonious color palette (e.g., #fafafa backgrounds, stark charcoal/black text, muted low-contrast secondary elements).

---

## 2. Structural & Visual Hierarchy

### Layout & Spacing
Structure and grouping are defined primarily by whitespace, rather than heavy borders or distinct boxes.
- Use negative space to separate concerns. When borders are necessary, they should be whisper-thin and low-contrast.

### Typography
Hierarchy is established through scale, font weight, and pristine, modern geometric or neo-grotesque fonts.
- **Top-level Headers:** Clean, balanced, and perfectly weighted.
- **Metadata:** Subtle, legible, and un-intrusive.
- **Data Values:** Refined typography that prioritizes readability without feeling like a raw data terminal.

---

## 3. UI Constraints

### Decorative Elements
- **Curated Imagery & Assets:** Do not use cheap or generic icons. Use sharp, well-aligned, minimalist iconography.
- **Empty States:** Empty states should be elegant, perhaps featuring a soft, subtle graphic or perfectly set typography that maintains the premium feel.

### Form Elements
- Dropdowns, filters, and inputs should feel premium and tactile.
- Avoid heavy boxed borders for inputs. Prefer soft backgrounds (`bg-gray-50`) or minimalist underline styles that feel sophisticated.

### Mobile-First Without Exception
- Minimum tap target: 44×44px.
- Form fields: minimum 48px height, 16px font size (prevents iOS zoom).
- Modal bottom sheets on mobile, centered dialogs on desktop.
- Interfaces should feel as fluid and native as a high-end mobile app.

---

## 4. Fluid Micro-Interactions
Animations should feel organic, smooth, and expensive.
- **Transitions:** Use smooth opacity fades, gentle y-axis reveals, and ease-in-out transitions.
- **Hover States:** Elements should respond with soft, subtle scaling or gentle shadow increases, inviting interaction without harsh jumps.
