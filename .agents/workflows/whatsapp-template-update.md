---
description: 
---

# Workflow: WhatsApp Template Update

## Steps

1. Identify which division's message is changing and exactly which
   new fields need to appear in the formatted output

2. Open lib/whatsapp/buildMessage.ts — update the formatDivisionPayload
   function for the relevant division only, do not touch other divisions

3. Apply this message formatting standard:
   - Section headers in bold: *SECTION NAME*
   - Dividers: ━━━━━━━━━━━━━━━━━━━━
   - Field values: *Label:* value (bold label, plain value)
   - The Tracking ID must always appear near the top
   - The admin ticket deep-link must always appear at the bottom
   - Emoji division identifier must appear in the header line

4. Check the Meta WhatsApp Business API rate limit logic in
   lib/ratelimit.ts — confirm the new message fits within the
   sliding window limit (60 messages per division per hour)

5. IMPORTANT: If this changes the structure significantly, flag that
   a new Meta message template approval may be required before
   production deployment — template approval takes 24–72 hours
   and unregistered template messages can be blocked by Meta

6. Write the updated message as a plain text preview in a comment
   block so the output is reviewable before any code runs