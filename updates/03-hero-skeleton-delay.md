# Update 03: Artificial Delay and Skeleton for Hero Section

## Overview
As requested, we are extending the skeleton loader behavior to the Hero Section of the division pages. Even though the Hero Section technically loads its data instantly, we will introduce a deliberate, artificial delay to show a structural skeleton. This ensures the entire page feels unified in its loading state.

## Objectives
1. Introduce an artificial loading delay to the `DivisionHero` component.
2. Build a `HeroSkeleton` that matches the exact layout footprint of the Hero Section (matching the breadcrumb, vertical accent line, and massive title text).

## Technical Action Plan

### 1. Build `HeroSkeleton.tsx`
Create `components/shared/skeletons/HeroSkeleton.tsx`.
- It will feature the same deep-blue background (`bg-brand-deep-blue`).
- It will include pulsing `bg-white/10` blocks that perfectly mimic the size and positioning of the breadcrumb navigation, the vertical red line, the main title text, and the tagline paragraph.

### 2. Update `DivisionHero.tsx`
Since `DivisionHero` is a Client Component (using `framer-motion`), we cannot use React Server Suspense directly on it without restructuring the layout. Instead, we will:
- Add a client-side artificial delay (e.g., 800ms to 1200ms) using `useEffect` and `useState`.
- Conditionally render `<HeroSkeleton />` while the delay is active.
- Once the delay completes, render the actual `framer-motion` animated Hero.

## Review Status
- [ ] **Pending Implementation**: Awaiting user approval to build the skeleton and add the delay.
