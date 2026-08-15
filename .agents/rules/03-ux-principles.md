---
trigger: always_on
---

# UX Principles — Think Like a Human First

Apply these principles before writing any UI component, form, or page.
The experience IS the product.

## Mobile-First Without Exception

The Quote Builder is used by clients on mobile devices at trade shows,
construction sites, and offices. Design every form, modal, and button
for a thumb on a 390px screen first. Desktop is the enhancement.

- Minimum tap target: 44×44px for all interactive elements
- Form fields: minimum 48px height, 16px font size (prevents iOS zoom)
- Modal bottom sheets on mobile, centered dialogs on desktop
- Never place two primary action buttons side by side on mobile

## Three States for Every Async Operation

Every action that touches the network must have all three states defined:

1. LOADING — Skeleton loader matching the shape of the content, or a
   spinner inside the button with disabled state. Never a blank void.
2. SUCCESS — Clear confirmation with the next logical action available.
3. ERROR — Human-readable message (not "Error 500"). Always include a
   recovery action: retry button, support WhatsApp link, or guidance.

"Something went wrong" with no recovery option is never acceptable.

## Form UX is the Core Product

The Quote Builder is the single most important interaction in the app.

- Validate inline on blur (field loses focus), not on submit
- Pre-fill the division field from whichever CTA opened the modal
- Never clear a partially filled form on a validation error
- Always show Step X of 4 progress so users know how far they are
- Phone field defaults to Ghana (+233) country prefix
- On mobile, trigger the correct keyboard: tel for phone, email for email
- Disable the submit button and show a spinner during submission
- Never re-enable the submit button during an in-progress request

## The Tracking UUID is the User's Receipt

After submission this UUID is the guest's only connection to their inquiry.
Treat it like a flight booking reference:
- Display it large and prominent, not in a small caption
- Provide a one-click copy button with clipboard feedback ("Copied!")
- Explain it in plain language: "Save this code to check your inquiry
  status anytime at prodealindustries.com/track"
- Send it again in the WhatsApp message the staff receives so staff
  can reference it when replying to the client

## Empty States are Content

Every list, grid, table, or search result must have a designed empty state:
- No products found → icon + "No products match your search" + clear filter button
- No tickets in admin → icon + "All clear! No open inquiries" message
- Filter returns nothing → suggest removing a filter, not just blank space

Never render an empty white box or silent nothing.

## Skeleton Loaders Must Match Content

A skeleton that looks nothing like the loaded content breaks trust.
- Same column count as the loaded grid
- Same approximate card height as real product cards
- Table skeletons: same number of columns as real table
- Use pulse animation (Tailwind: animate-pulse) on bg-slate-200 shapes