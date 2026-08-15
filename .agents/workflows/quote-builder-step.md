---
description: 
---

# Workflow: Quote Builder Step Change

## Steps

1. Identify which step is affected (1–4) and which division(s) this
   change applies to — or if it is a global change to all divisions

2. Check the Zustand store interface in store/quoteStore.ts — if this
   change requires a new state field or action, update the interface
   and confirm before building the UI

3. Build the step component with this UX checklist applied:
   - Validate on blur (field loses focus), not on submit
   - Pre-fill any field that can be inferred from existing store state
   - Never clear existing valid field values when re-rendering
   - Every input has an associated visible label (not just placeholder)
   - Phone fields use react-phone-number-input with +233 as default
   - File uploads enforce MIME type and 10MB limit client-side via
     react-dropzone accept prop (server enforcement is separate)

4. Update the Step 4 (ReviewSubmit) summary card to reflect any new
   fields added — the review screen must show everything the user entered

5. Update the Zod schema for this division in lib/validators/inquiry.ts
   to include any new required or optional fields

6. Confirm the WhatsApp message template in lib/whatsapp/buildMessage.ts
   surfaces the new field — a field collected but never sent to staff
   is a silent data loss bug

7. Test the step mentally at 390px mobile width — is every input
   reachable, readable, and the correct keyboard type triggered?