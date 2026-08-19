# DESIGN SYSTEM: High-End Luxury Minimalism

**Purpose:** Serves as the immutable source of truth for the visual language, interaction design, and UI constraints of the Pro Deal Industries platform. Inspired by the refined, restrained aesthetics of luxury industrial design, high-end skincare, and curated boutique interfaces (Apple, Aesop, Dieter Rams).

---

## 1. Core Architectural Aesthetics

The platform rejects noisy, consumer-grade fluff and brutalist clutter in favor of effortless clarity, quiet confidence, and pristine whitespace.

### 🏛️ The 5 Pillars of Minimalist Design

1. **Whitespace as Structure (Negative Space):**
   - Layouts breathe through generous margins and internal padding (`p-5`, `p-6`, `gap-4`, `gap-6`).
   - Grouping is defined by spatial proximity rather than heavy dividing lines or dense boxes.

2. **Whisper-Thin Borders & Subtle Elevation:**
   - Eliminate heavy borders (`border-2`, stark black outlines).
   - Use whisper-thin, low-contrast borders (`border-slate-100` or `border-slate-200/60`).
   - Employ soft ambient shadows (`shadow-[0_4px_30px_rgba(0,0,0,0.03)]`) that add organic depth without visual noise.

3. **Zero Visual Redundancy (Noise Elimination):**
   - **No Status Spam:** Never display redundant status badges or explanatory tags (e.g. no "Live Sync", "Matches Status", or duplicate phone pills).
   - **Self-Evident Actions:** If a button or state transition is intuitive, omit the label or relegate it to an unobtrusive micro-hint.
   - **Max 3 Visual Levels:** Every card or list item must contain at most 3 distinct visual tiers:
     1. *Identity / Title* (Bold, high-contrast, clean icon).
     2. *Context / Metadata* (Muted, readable, line-clamped with hover tooltip).
     3. *Action* (Crisp, tactile buttons with clear affordances).

4. **Hover Inspectability Doctrine:**
   - Any text field that is clamped or truncated (`truncate`, `line-clamp-1`, ellipsis) **MUST provide an unabridged `title={...}` attribute** and cursor affordance (`cursor-help`).
   - Users must never be left guessing what a clipped string or truncated reference code says.

5. **Mobile-First Ergonomics & Viewport Anchoring:**
   - **44px–48px Minimum Touch Targets:** All buttons, pills, toggles, and dropdown triggers must meet or exceed 44×44px interactive areas.
   - **Zero iOS Zooming:** All text inputs must use `text-base` (16px) or `text-sm` with proper viewport meta to prevent browser zoom jumps.
   - **Universal Viewport Insets:** Mobile modals and dropdown popovers must anchor cleanly to the viewport (`fixed top-16 left-3 right-3`) with zero horizontal clipping on narrow phone screens.

---

## 2. Typography & Color Palette

### 🎨 Curated Color Palette
| Token | Hex / Class | Semantic Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#fafbfd` (`bg-slate-50/50`) | Soft ambient canvas |
| **Surface Card** | `#ffffff` (`bg-white`) | Clean elevated surfaces |
| **Primary Charcoal** | `#0f172a` (`text-brand-deep-blue`) | High-contrast headings and primary values |
| **Secondary Slate** | `#64748b` (`text-slate-500`) | Subtitles, labels, and secondary context |
| **Muted Slate** | `#94a3b8` (`text-slate-400`) | Timestamps, metadata, and placeholder text |
| **Brand Accent Blue** | `#0651ed` (`text-brand-blue`) | Primary interactive accents and active pills |
| **Emerald Success** | `#059669` (`bg-emerald-50 text-emerald-700`) | Completed milestones, dispatched states |
| **Amber Caution** | `#d97706` (`bg-amber-50 text-amber-700`) | Pending reviews and production batches |

### ✍️ Typography Tokens
- **Display Headings:** `font-display font-bold tracking-tight text-brand-deep-blue`
- **Section Headers:** `text-xs font-semibold uppercase tracking-wider text-slate-400`
- **Numerical Metrics:** `font-display font-bold text-3xl sm:text-4xl text-brand-deep-blue tracking-tight leading-none`
- **Body & Captions:** `font-sans text-xs sm:text-sm text-slate-600 leading-relaxed`

---

## 3. UI Component Constraints

### Buttons & Actions
- **Primary:** `bg-brand-deep-blue hover:bg-brand-blue text-white rounded-xl font-semibold shadow-xs active:scale-[0.98]`
- **Secondary / Ghost:** `border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 rounded-xl active:scale-[0.98]`
- **Success Dispatch:** `bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs active:scale-[0.98]`
- **Always `whitespace-nowrap shrink-0`** on action buttons to prevent vertical text wrapping bugs.

### Forms & Floating Inputs
- Minimum height: `48px` on mobile, `40px` on desktop.
- Style: `bg-slate-50/70 focus:bg-white rounded-xl border border-slate-200/80 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/5 text-sm font-medium text-brand-deep-blue outline-none transition-all`.
- No raw square boxes or brutalist underline borders.

### Modals & Drawers
- **Mobile (< 640px):** Smooth slide-over / bottom sheet (`rounded-t-3xl border-t border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.15)] pb-safe`).
- **Desktop (≥ 640px):** Floating drawer / popover (`rounded-2xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.12)]`).

---

## 4. Micro-Interactions & Transitions
- **Spring Transitions:** Use gentle spring transitions for layout animations (`framer-motion` layout ID pills).
- **Subtle Scaling:** Hover states respond with gentle `hover:shadow-xs` or `active:scale-[0.98]`.
- **Zero Layout Jitter:** Content dimensions remain stable during state transitions.
