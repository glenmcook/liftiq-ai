# Threat Model

## Project Overview

LiftIQ AI is an AI-powered personal training platform built on Node.js/Express (API), React/Vite (web), and Expo React Native (mobile). It generates workout plans via GPT-4o, tracks training sessions, parses DEXA body-composition scans, provides AI coaching check-ins, and manages Stripe subscriptions. The API connects to a PostgreSQL database via Drizzle ORM.

## Assets

- **User fitness data** — workout plans, sessions, logged sets, personal records, and strength charts. Compromise exposes detailed health and behavioral data.
- **Body composition data** — DEXA scan results (body fat %, lean mass, bone density, visceral fat level). Highly sensitive health PII.
- **Check-in notes** — mood, energy, adherence notes submitted by the user. Sensitive personal health narrative.
- **Diet profile** — caloric targets, dietary preferences, allergies. PII with health sensitivity.
- **Stripe billing data** — customer ID, subscription status, checkout flows. Compromise allows unauthorized billing changes.
- **Application secrets** — `DATABASE_URL`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `AI_INTEGRATIONS_OPENAI_API_KEY`. Leakage allows full data access, financial fraud, and AI cost abuse.
- **OpenAI API quota** — AI endpoints (plan generation, check-in, diet, DEXA parse) consume paid API quota. Unauthenticated access enables quota exhaustion.

## Trust Boundaries

- **Internet / API server** — all HTTP requests from browsers, mobile apps, and third parties cross this boundary. The API MUST authenticate and authorize every non-public request.
- **API server / PostgreSQL** — application has direct DB access. SQL injection at the API layer would grant full database access. Currently using Drizzle ORM with parameterized queries (low risk here).
- **API server / OpenAI** — AI calls consume paid quota under the `AI_INTEGRATIONS_OPENAI_API_KEY`. Unauthenticated endpoints allow any caller to trigger AI calls.
- **API server / Stripe** — server calls Stripe with `STRIPE_SECRET_KEY`. Unauthenticated checkout and portal endpoints allow unauthorized billing operations.
- **Public / Authenticated** — currently no authentication boundary is enforced; all routes are publicly accessible.

## Scan Anchors

- **API routes**: `artifacts/api-server/src/routes/` — all routes, none currently have auth middleware
- **App entry point**: `artifacts/api-server/src/app.ts` — CORS and middleware configuration
- **AI-triggering routes**: POST `/plans/generate`, POST `/checkins`, POST `/diet/recommendations`, POST `/dexa-scans/parse`
- **Billing routes**: POST `/stripe/checkout`, POST `/stripe/portal`
- **Static file server**: `artifacts/fitforge-mobile/server/serve.js` (dev/mobile serving only)
- **Dev-only areas**: `artifacts/mockup-sandbox/` — design mockups, not production-reachable

## Threat Categories

### Spoofing

No authentication layer exists. Any caller with the API URL can impersonate the user. All read and write endpoints are fully public.

**Required guarantee**: All state-mutating and data-retrieval endpoints MUST require a valid, server-verified session or API token before processing the request.

### Tampering

Without authentication, any caller can overwrite the user's profile, generate a new workout plan (deactivating the existing one), log arbitrary workout sets, or modify session data. The Stripe checkout endpoint accepts any `priceId` from the request body.

**Required guarantee**: Server-side authorization must verify the caller owns the resource before any write or delete operation.

### Information Disclosure

All personal health data (DEXA scans, check-in notes, body composition, workout history) is accessible without authentication. CORS is fully open (`cors()` with no options), allowing any web origin to read this data cross-origin. Stack traces are not returned to clients (500s return generic messages), which is good.

**Required guarantee**: CORS must be restricted to known origins. All data endpoints must require authentication.

### Denial of Service

Four endpoints trigger expensive OpenAI API calls without rate limiting or authentication: plan generation, check-in, diet recommendation, and DEXA parse. Any unauthenticated caller can exhaust the OpenAI quota or incur large API costs.

**Required guarantee**: AI endpoints MUST be behind authentication and SHOULD have per-user rate limits. File upload endpoint (DEXA parse) has a 15 MB size limit, which is appropriate.

### Elevation of Privilege

The Stripe checkout (`POST /stripe/checkout`) and portal (`POST /stripe/portal`) endpoints are fully unauthenticated. An attacker can initiate checkout sessions or billing portal sessions for the stored customer profile, potentially redirecting the user to attacker-controlled payment flows or canceling subscriptions.

**Required guarantee**: Stripe billing endpoints MUST require authentication. The `priceId` accepted in checkout must be validated against allowed price IDs from the Stripe catalog.
