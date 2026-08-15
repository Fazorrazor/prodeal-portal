---
description: # Workflow: New Division Feature
---

# Workflow: New Division Feature

## Steps

1. Identify which division this feature belongs to and state it explicitly
2. Re-read .agents/rules/05-division-context.md for that division's rules
3. Check if the feature requires a new API route — if yes, draft the Zod
   schema first and confirm before writing the route handler
4. Build the Server Component shell first, then layer in Client Components
   only where interactivity is genuinely needed
5. Add a skeleton loader that matches the component's layout
6. Add an ErrorBoundary wrapper
7. Verify the feature works on a 390px mobile viewport mentally
8. Confirm WhatsApp message template is updated if the feature adds new
   inquiry fields