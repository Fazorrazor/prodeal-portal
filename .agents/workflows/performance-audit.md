---
description: 
---

# Workflow: Performance Audit

## Steps

1. Identify the specific page or component that is slow — do not
   run a blanket audit on the whole app, focus the investigation

2. Check Server vs Client Component split:
   - Is this component a Client Component when it doesn't need to be?
   - Is it fetching data client-side that could be fetched server-side?
   - Is useEffect being used to fetch data? Replace with Server Component

3. Check images on the affected page:
   - All images must use next/image, never <img>
   - Hero images must have priority prop set
   - All images must have explicit width and height or use fill + sizes
   - Product images: sizes="(max-width: 768px) 100vw, 33vw"

4. Check bundle size for Client Components:
   - Is a heavy library being imported at the top level of a
     Client Component? Use dynamic import with { ssr: false } instead
   - Are all icon imports using named imports, not the whole library?
     WRONG:  import * as Icons from 'lucide-react'
     RIGHT:  import { ChevronRight } from 'lucide-react'

5. Check Supabase query efficiency:
   - Is the query selecting * when only 3 columns are needed?
   - Is there a missing index on a WHERE or ORDER BY column?
   - Is the same query being called multiple times per render?

6. Check ISR / caching configuration for the affected route —
   is it accidentally set to dynamic when it should be cached?

7. Report findings as a prioritised list: High / Medium / Low impact
   before making any changes