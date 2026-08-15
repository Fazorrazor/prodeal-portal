---
description: 
---

# Workflow: UI Lifecycle and State Side-Effects

## The Core Philosophy
When building highly interactive Next.js / React applications using global state managers (like Zustand), you must never confuse the **Data Lifecycle** with the **UI Lifecycle**. 

A common trap is writing a "Clean up" or "Reset" function that wipes the user's data after a successful API call, but inadvertently flips boolean flags that instantly unmount the UI components before the user can see the success state.

## Rules of Execution

### Rule 1: Never Nuke the Room You Are Standing In
Do not trigger global reset actions (e.g., `resetStore()`) from inside a component's submit handler if that reset action alters the `isOpen` or `isVisible` state of the component itself. It will cause the UI to instantly vanish, breaking the "Three States of Async" UX principle.

### Rule 2: Separate Data Reset from UI Reset
If you must clear a form immediately after submission, only clear the specific data arrays or strings (e.g., clearing the uploaded files array). Leave the global visibility booleans untouched until the user explicitly acknowledges the success state.

### Rule 3: Defer Resets to the Exit Animation
When managing modals or dialogs (especially those using Framer Motion's `AnimatePresence`), the safest place to execute a "Reset Everything" action is *after* the exit animation completes. 

**Correct Pattern:**
```typescript
const handleClose = () => {
  closeModal(); // 1. Trigger the CSS exit animation
  setTimeout(() => {
    resetStore(); // 2. Wipe the data safely behind the scenes 300ms later
  }, 300);
};
```

### Rule 4: Think Chronologically
Before calling any state update, ask yourself:
1. What will this state change do *visually*?
2. What component reads this state?
3. Am I destroying the current visual context the user relies on?

By adhering to this workflow, we prevent "flashing" UIs and ensure users always receive explicit confirmation of their actions before the screen clears.
