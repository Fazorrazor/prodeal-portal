---
description: 
---

# Workflow: UI/UX Component Overhaul

Follow this exact sequence when asked to overhaul, design, or restyle a UI component or page section for the Pro Deal Industries portal.

## Step 1: Mobile-First Structural Review
Before writing any CSS or changing colors, analyze the physical constraints of a 390px mobile screen:
- **Spacing:** Are forms cramped? Ensure input fields and buttons are not sharing horizontal space if they contain long strings (e.g., a 36-char UUID). Stack them.
- **Scrolling:** Is there horizontal overflow? Convert to a horizontal scroll container (`overflow-x-auto`) with `.hide-scrollbar` and dynamic edge-fade gradients, or stack vertically.
- **Accessibility:** Are tap targets at least 44x44px? Are inputs at least 48px high to prevent iOS zoom?

## Step 2: Decorative Element Purge (The Focus Rule)
Remove all visual clutter that competes with the primary user action:
- **DELETE** large, standalone, decorative icons (e.g., massive floating MapPins, packages, or background SVGs).
- **DELETE** generic clip-art or stock illustrations meant merely to "fill space".
- **RETAIN** strictly functional, inline icons (e.g., a search magnifying glass, directional arrows inside buttons, or tiny status indicators).

## Step 3: Typography & Layout Execution
Achieve the "premium B2B" aesthetic exclusively through layout mathematics, not graphics:
- **Headers:** Use `font-heading`, `font-bold`, and tight tracking (`tracking-tight`) for major titles.
- **Hierarchy:** Use contrast and opacity (`text-brand-deep-blue/70`) for secondary text to make the primary text pop.
- **Padding:** Increase padding heavily on desktop (`p-10` to `p-16`) to create breathing room, while keeping it practical on mobile (`p-6` to `p-8`).

## Step 4: Component Logic & Redundancy Check
Ensure the UI directs the user cleanly:
- Are there two identical Call-to-Action buttons visible on screen at the same time? Conditionally hide redundant CTAs based on data length.
- Does an empty list render a blank white box? Ensure every empty state has a deliberate, branded message.

## Step 5: Cardless UI & Minimalist Depth
Eliminate the use of "cards" (floating boxes, borders, and enclosed backgrounds). Content must sit naked on the main canvas:
- **No Background Boxes:** Do not wrap sections in `bg-white` over a gray background to create cards.
- **No Drop Shadows:** Eliminate `shadow-sm`, `shadow-lg`, or glassmorphism effects (`backdrop-blur`).
- **Naked Inputs:** Form fields should be ultra-minimalist. Prefer bottom-borders only (`border-b-2`) with transparent backgrounds over fully boxed inputs.
- **Whitespace is the Boundary:** Use generous vertical and horizontal padding to separate content instead of drawing artificial borders between sections.

## Step 6: Final Verification Checklist
Before submitting the code, verify:
- [ ] Is the primary user action (CTA) the absolute center of attention?
- [ ] Has all decorative "fluff" been removed?
- [ ] Will a 36-character string fit in the mobile input without truncating?
- [ ] Does it look utilitarian, precise, and premium?
