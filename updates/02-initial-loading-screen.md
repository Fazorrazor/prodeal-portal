# Update 02: Kinetic Brutalism "Terminal Boot" Splash Screen

## Overview
To create a powerful first impression that aligns with the B2B Brutalist aesthetic, we are implementing an initial "boot sequence" splash screen. This animation will run only for first-time visitors, ensuring it captures attention without becoming annoying during regular use.

## Objectives
1. **High-Impact Animation**: Utilize `framer-motion` and `useScrambleText` to simulate a high-tech industrial terminal coming online.
2. **First-Time User Targeting**: Ensure this sequence strictly executes only once by tracking the user.

## Technical Action Plan

### 1. Build `TerminalBootSequence.tsx`
Create a high-impact, full-screen client component that locks the page scroll while active.
- **Animation Sequence**:
  - Phase 1: Solid `brand-deep-blue` canvas.
  - Phase 2: Sharp, linear grid borders actively draw themselves onto the screen (from 0% to 100% height/width) using `framer-motion`.
  - Phase 3: "PRODEAL INDUSTRIES LTD." decrypts in the center using the `useScrambleText` hook.
  - Phase 4: A terminal-style progress bar snaps to 100%.
  - Phase 5: The entire screen forcefully slides up/splits open, revealing the portal behind it.

### 2. State & One-Time Tracking
To fulfill the requirement of showing this only once based on user identity (IP/Device):
- **Implementation**: We will create a robust check on page load. While we *can* use your existing Upstash Redis to log the actual IP addresses, the most performant and layout-shift-free method is to use **Next.js Cookies / Local Storage**. 
- On their very first visit, we play the animation and set a persistent `has_seen_boot=true` flag on their device.
- On subsequent visits, the `layout.tsx` reads this flag and bypasses the splash screen entirely, rendering the main portal instantly.

### 3. Integration in `app/layout.tsx`
- We will inject this component into the root layout so it perfectly overlays the entire portal before any other content can be interacted with.

## Review Status
- [ ] **Pending Implementation**: Awaiting approval to begin coding the animation and tracking logic.
