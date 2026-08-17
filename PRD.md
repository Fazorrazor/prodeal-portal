# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Purpose:** Outlines the core features, business objectives, and—crucially—the Non-Functional Requirements (NFRs) and Disaster Recovery protocols for the Pro Deal Industries platform.

---

## 1. Core User Journeys

### The Guest B2B Client
**Goal:** Submit a request for a quote with absolute zero friction.
**Journey:**
1. Selects Division.
2. Browses product catalog or inputs project specifications.
3. Fills out Quote Builder form (Mobile-first, validated inline).
4. Receives a Success screen and a Tracking UUID.
5. Can check status later at `/track/[trackingId]`.

### The Division Staff Member
**Goal:** Receive and respond to quote requests instantly.
**Journey:**
1. Receives structured WhatsApp message via Meta Business API containing the tracking UUID and division-specific fields.
2. Continues negotiation directly with the client.

### The Administrator
**Goal:** Manage catalog data and oversee ticket statuses.
**Journey:**
1. Logs into `/admin` (Protected by Supabase Auth).
2. Manages inventory, products, and global settings.

---

## 2. Non-Functional Requirements (NFRs) & Service Level Objectives

- **Time to Interactive (TTI):** Must be < 1.5 seconds on a 3G mobile connection. No heavy client bundles.
- **Availability:** 99.99% uptime for the public catalog. 
- **Data Integrity:** Zero dropped inquiries. Every form submission must hit the database before any external API calls are made.
- **Traceability:** 100% of network logs, database rows, and WhatsApp payloads must include the specific `tracking_uuid` for cross-system debugging.

---

## 3. Disaster Recovery & Graceful Degradation Matrix

A 50-year veteran assumes everything will fail. Here is how the system responds:

| Failure Point | System Response | User Experience |
| :--- | :--- | :--- |
| **WhatsApp API goes down** | Database write succeeds. Async WhatsApp call fails and is logged to a dead-letter queue. | Uninterrupted. Receives "Success" screen. |
| **Upstash Redis goes down** | Rate-limiting is bypassed, system defaults to in-memory Next.js failover limit. | Uninterrupted. |
| **Supabase goes down** | Edge functions catch the 500 error, logging the payload to Upstash Redis as a fallback queue. | Receives a polite "System Maintenance" error, but data is preserved for retry. |
| **Client loses internet during submit** | Service Worker / offline queue caches the POST request and retries when connectivity is restored. | UI shows "Connecting..." spinner until resolved. |

---

## 4. Division-Specific Functional Rules

- **3D Signages:** Must support secure multipart file uploads (for blueprints/artwork).
- **Chemicals:** Must enforce legal "Intended Use" text fields and provide signed-URL downloads for Safety Data Sheets (SDS).
- **Bowls:** Must block submissions if the requested quantity exceeds live `stock_level`.
- **Printing:** Must enforce Minimum Order Quantity (MOQ) logic dynamically in the UI.
