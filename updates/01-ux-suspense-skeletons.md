# Update 01: Instant Navigation, Suspense Boundaries, and Skeleton Loaders

## Overview
To improve the perceived performance and align with the "Kinetic Brutalism" UX rules, we are modifying how data-heavy components load across the portal. Currently, navigating between divisions (e.g., from Bowls to Signages) causes the browser to "hang" while waiting for server data. 

We will implement React Suspense to allow instant page transitions, displaying structural pulse skeletons while data is fetched, and applying a terminal-style text scramble effect as the data resolves.

## Objectives
1. Eliminate navigation lag between division pages.
2. Replace blank loading states with accurate, structural pulse skeletons.
3. Integrate data scrambling for dynamic metrics to match the B2B brutalist design system.

## Action Plan

### 1. Build Skeleton Components
Create strictly functional, unstyled skeleton components that mimic the exact layout of their loaded counterparts, utilizing `animate-pulse` and standard brutalist borders/backgrounds:
- `GallerySkeleton.tsx` (for 3D Signages portfolio images)
- `TableSkeleton.tsx` (for Bowls inventory table)
- `CardSkeleton.tsx` (for Chemicals and Souvenirs catalogs)

### 2. Implement React Suspense in Page Layouts
Modify the division `page.tsx` files to decouple data fetching from the main page render:
- Wrap `SignageGallery` in `<Suspense fallback={<GallerySkeleton />}>`
- Wrap `InventoryTable` in `<Suspense fallback={<TableSkeleton />}>`
- Wrap `ChemicalCatalog` in `<Suspense fallback={<CardSkeleton />}>`

### 3. Apply Text Scrambling (`useScrambleText`)
Integrate the scrambling hook on critical dynamic text points when the skeleton fallback completes:
- Image captions / project metadata in 3D Signages.
- Stock counts and status values in the Bowls Inventory Table.
- CAS numbers, MOQs, and pricing in Chemicals/Souvenirs.

## Review Status
- [ ] **Pending Implementation**: Awaiting approval to begin coding step 1.
