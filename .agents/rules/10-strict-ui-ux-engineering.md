# Rule: Strict UI/UX Engineering & Mobile-First Defense

To prevent visual regressions, layout breaking, and amateur UI mistakes, the Agent MUST adhere to these strict engineering principles for every UI component.

## 1. The Stacking Context & Portal Rule (Zero Overlaps)
- **The Flaw:** Simply adding `z-[9999]` does not escape a parent's stacking context (e.g., `relative z-10`). This causes modals to render underneath fixed navigation headers.
- **The Rule:** Any overlay that must cover the entire screen (Modals, Lightboxes, Global Toasts, Full-Screen Menus) **MUST** be rendered using React's `createPortal(content, document.body)`. Never attempt to absolute-position a global modal inside a localized DOM node.

## 2. Defensive Aspect Ratios & Media Handling
- **The Flaw:** Forcing `aspect-video` or hardcoded `width/height` on media causes vertical (portrait) videos to shrink, generate massive black bars, or distort.
- **The Rule:** Never hardcode aspect ratios on user-uploaded media containers unless you intend to aggressively crop (`object-cover`). For viewing media, ALWAYS use `object-contain` combined with fluid bounds (e.g., `max-h-[80vh] w-full`) so the container respects the natural dimensions of the media.

## 3. Strict Mobile-First Execution (390px Constraint)
- **The Flaw:** Building for desktop and shrinking to mobile pushes critical elements (like Call-to-Action buttons) below the fold or causes horizontal scroll breaking.
- **The Rule:** Every layout must be designed for a 390px iPhone viewport first. 
  - Never allow non-essential media (videos, large images) to push the primary CTA below the fold on initial load. Use tight, panoramic constraints (e.g., `aspect-[21/9]`) on mobile for ambient media.
  - Interactive elements (close buttons, arrows) must have a minimum `44x44px` touch target.
  - Floating controls (like Prev/Next arrows) must be pushed to the absolute edges (`left-2`, `right-2`) on mobile so they don't overlap the central content.

## 4. Interaction & Focus Management
- **The Flaw:** Modals that don't lock scrolling allow the user to scroll the background page while the modal is open, breaking the UX.
- **The Rule:** All modals MUST apply `document.body.style.overflow = 'hidden'` on mount and clean it up on unmount. All modals MUST support `Escape` key to close.

---
**Enforcement:** Before the Agent finalizes any UI code, it must explicitly verify that it did not trap a modal in a stacking context, did not distort media with a forced aspect ratio, and did not push a mobile CTA out of the viewport.
