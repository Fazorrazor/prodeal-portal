# Prodeal Portal

B2B wholesale product catalog, instant Request for Quote (RFQ) submission workflow, and internal operations portal for Prodeal Industries Ltd.

## Features

- **Wholesale Product Catalog:** Browse industrial chemicals, bulk disposable bowls, 3D signages, and corporate souvenirs across dedicated division and solution pages.
- **Instant RFQ Tray:** Add catalog items to an RFQ tray and submit quote requests with automated email and SMS notifications.
- **Order and Inquiry Tracking:** Public inquiry tracking and support routes (`/inquiry`, `/track`, `/support`).
- **Operations and Admin Portal:** Internal operations dashboard (`/ops`, `/admin`) secured with WebAuthn passkeys and Argon2 credential hashing.
- **Search and Rate Limiting:** Client-side fuzzy search via Fuse.js with Upstash Redis rate limiting and QStash background dispatch.

## Tech Stack

- **Framework:** Next.js 16, React 18, TypeScript, Tailwind CSS
- **Database and Auth:** Supabase (PostgreSQL), SimpleWebAuthn, Argon2, Jose
- **Messaging and Queues:** Resend, Twilio, Upstash Redis, Upstash QStash
- **Testing:** Vitest, Playwright

## Local Development

```bash
git clone https://github.com/Fazorrazor/prodeal-portal.git
cd prodeal-portal
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

- `npm run dev` - Start the local development server
- `npm run build` - Build the production bundle
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint checks
- `npm test` - Run unit tests with Vitest
