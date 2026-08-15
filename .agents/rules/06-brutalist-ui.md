---
trigger: always_on
---

# UI/UX Rule — Data-Dense B2B Brutalism (Cardless UI)

When making UI/UX changes, adding new features, or redesigning sections of the Pro Deal Industries portal (especially the Admin Dashboard), you MUST adhere to the **Data-Dense B2B Brutalism** design system. 

This system prioritizes raw data density, strict typographic hierarchy, and terminal-like efficiency over modern "consumer SaaS" aesthetics.

## CORE TENET: The "Naked Canvas" Architecture
Never use floating white cards to group content. 
- **DO NOT USE**: `bg-white`, `rounded-xl`, `shadow-sm`, or `shadow-md` to wrap sections of the page.
- **DO USE**: Elements must sit directly on the application's background canvas (`bg-transparent` or implicit background). 

## 1. Structural Demarcation via Borders
Because there are no white card backgrounds, structure and grouping are defined strictly by borders and typography.
- Use sharp, linear borders (`border-b`, `border-b-2`, `border-l`, `border-t`) to separate sections.
- Borders should usually be the brand color with opacity (e.g., `border-brand-border/60` or `border-brand-deep-blue`).

## 2. Extreme Typographic Hierarchy
Hierarchy is established entirely through extreme contrasts in font size and letter-spacing (tracking).
- **Top-level Headers**: Massive, tight-tracked fonts (e.g., `text-3xl font-heading font-bold tracking-tighter leading-none`).
- **Metadata / Field Labels**: Tiny, wide-tracked uppercase fonts (e.g., `text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60`).
- **Data Values**: Highly legible, often monospaced, standard sizes (e.g., `text-sm font-bold font-mono`).

## 3. Data Density over Whitespace
B2B users need to see maximum data on screen. Do not use excessive "friendly" padding.
- Tighten grid gaps (e.g., use `gap-4` or `gap-6` instead of `gap-8` or `gap-12` when listing metrics).
- Tighten table cell padding (e.g., `py-4 px-4` instead of massive `py-6 px-6`).
- Minimize heights on navigational elements (e.g., header heights should be `h-16`, not `h-24`).

## 4. Unboxed Interactive Elements
Dropdowns, filters, and inputs should feel integrated into the structure, not like floating bubbles.
- Use `border-b` inputs instead of fully boxed `border rounded-md` inputs.
- Keep buttons and links raw and typography-driven where possible, using hover effects (`hover:bg-black/5` or `hover:text-brand-blue`) instead of solid colored backgrounds, unless it's a primary Call to Action.

## 5. Stark Empty States
Empty states should not look "cute" or use massive, friendly SVG illustrations.
- Use a stark, bold headline (e.g., "All clear.") sitting on a top border (`border-t`).
- No centered boxes or "empty inbox" icons.

## 6. Kinetic Brutalism (Motion & Interaction)
Animations should feel like a high-tech terminal or architectural blueprint coming online, not a bouncy consumer app.
- **Line Drawing**: Major structural borders (`border-b`, `border-l`) must animate their length (from `0%` to `100%`) using `framer-motion` to feel like they are being actively drawn. Do not just fade them in.
- **Data Scrambling**: Numeric values, tracking IDs, and critical metadata must use the `useScrambleText` hook to cycle through random characters/symbols before locking into the real data. This simulates a real-time data decryption sequence.

**Failure to adhere to this cardless brutalist aesthetic will result in a visual regression of the platform.**
