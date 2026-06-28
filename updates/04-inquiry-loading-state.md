# Update 04: Inquiry Page Loading State (Instant Transition)

## Overview
We are expanding the Suspense + Skeleton architecture to the product inquiry flow. When a user clicks "Inquire" on any product, they currently experience a slight delay while the Next.js server fetches the product details from Supabase. We will eliminate this delay by implementing a structural skeleton loader for the inquiry page.

## Objectives
1. Make navigation to the `/inquiry/[productId]` route feel instantaneous.
2. Provide a B2B-brutalist loading skeleton that perfectly mimics the two-pane layout of the Inquiry page.
3. Integrate text-scrambling data effects for the loading status to match the rest of the portal.

## Technical Action Plan

### 1. Build `InquirySkeleton.tsx`
Create `components/shared/skeletons/InquirySkeleton.tsx` to mirror the structure of `InquiryPageClient`:
- **Left Pane (Context)**: A pulsing image block, a scrambled skeleton title, and pulsing blocks for the "What happens next" steps.
- **Right Pane (Form)**: Pulsing input field blocks mimicking the exact shape of the form (name, email, phone, quantity).

### 2. Implement `loading.tsx`
In Next.js App Router, placing a `loading.tsx` file inside a route directory automatically wraps the `page.tsx` in a React Suspense boundary.
- Create `app/(public)/inquiry/[productId]/loading.tsx`.
- Have it render the `<InquirySkeleton />`.

## Review Status
- [ ] **Implemented**: Skeleton and loading file created and deployed.
