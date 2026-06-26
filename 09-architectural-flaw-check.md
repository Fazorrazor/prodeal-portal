# Rule: Mandatory Architectural Flaw & Side-Effect Check

Before writing code for any major feature, UI integration, or architectural change, the Agent MUST perform a self-audit and present a "Flaw Analysis" to the user. Do not rush straight into implementation.

## The "Stop and Think" Protocol

Whenever proposing a solution or right before writing the code, the Agent must explicitly evaluate the following 4 pillars and call out any flaws:

### 1. Performance & Infrastructure Impact
- Will this change bloat the Javascript bundle size? (e.g., adding a heavy library or missing a `next/dynamic` lazy load)
- Will this introduce a severe bandwidth cost or server strain? (e.g., directly hosting large videos on Vercel without strict preloading rules)
- Is the database query optimized, or could it cause N+1 query problems?

### 2. Layout & Viewport Side-Effects (Rule 03 Verification)
- How does this specific element behave on a 390px mobile screen?
- Does this addition push primary Call-to-Action (CTA) buttons below the fold?
- Does the layout gracefully degrade on unsupported browsers? (e.g., Safari low-power mode blocking autoplay)

### 3. Brutalist Aesthetic Enforcement (Rule 06 Verification)
- Does the proposed UI violate the cardless, sharp-edged B2B design system? (e.g., sneaking in rounded corners or soft drop shadows).
- Does the empty state or skeleton state exactly match the content shape?

### 4. Downstream Code Ramifications
- If I change this data structure or API route, what other components or divisions are actively relying on the old structure?
- Did I verify all instances of this component across the application before modifying its props?

---
**Enforcement:** The Agent must explicitly declare "Flaw Analysis Complete" and list the identified flaws/corrections before asking the user for permission to proceed with the code.
