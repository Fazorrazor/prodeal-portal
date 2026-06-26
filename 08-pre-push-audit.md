# Pre-Push Security & Optimization Audit

Before any code is committed and pushed to the repository, the Agent MUST proactively initiate and pass this audit. Do not wait for the user to ask—run this automatically.

## 1. Dead Code & Complexity Sweep
- **Duplicate Logic:** Identify any repetitive logic blocks (e.g., duplicated formatting functions, duplicate fetch wrappers) and extract them into shared utilities.
- **Unused Components:** Scan for imported but unused components or functions. Remove them unless they are explicitly marked as WIP for an upcoming feature.
- **Unnecessary Complexities:** Simplify over-engineered components. (e.g., Replace complex `useEffect` chains with derived state, remove unnecessary wrapper `<div>`s that don't add structural value).

## 2. Security Hardening
- **Environment Leaks:** Ensure no `.env` variables (especially `SUPABASE_SERVICE_ROLE_KEY`) are exposed in client components or `console.log` statements.
- **API Defense:** Verify that every single `POST`, `PATCH`, or `DELETE` API route or Server Action implements strict Zod validation AND Upstash Rate Limiting before executing database writes.

## 3. UI & UX Polish (Brutalist Enforcement)
- **Console & Alerts:** Strictly prohibit the deployment of `console.log()`, `window.alert()`, or `window.confirm()`. All feedback must use native brutalist UI modals or the established toast system.
- **Skeleton States:** Ensure any new async components have matching skeleton loaders. No blank voids allowed.

## 4. Performance Check
- **Caching Rules:** Check `revalidate` and `cache` directives. Ensure public pages are properly cached and admin pages enforce fresh data.

---
**Enforcement:** If any of these checks fail during the pre-push audit, stop the push, fix the violation, explain the correction, and then proceed with the deployment.
