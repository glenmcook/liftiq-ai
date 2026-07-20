# LiftIQ AI

AI-powered personal training platform: generates workout plans, tracks sessions, charts strength gains, and provides nutrition and body-composition coaching — available on web and mobile.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from `PORT` env)
- `pnpm --filter @workspace/fitforge run dev` — run the web app
- `pnpm --filter @workspace/fitforge-mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

Required env vars: `DATABASE_URL` (Postgres), `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (`artifacts/api-server`)
- Web: React + Vite + Wouter + Tailwind + Radix UI (`artifacts/fitforge`)
- Mobile: Expo React Native + Expo Router (`artifacts/fitforge-mobile`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (OpenAPI spec → React Query hooks)
- Payments: Stripe (Replit native integration)
- AI: OpenAI via Replit AI Integrations proxy

## Where things live

| What | Path |
|---|---|
| DB schema | `lib/db/src/schema/` |
| OpenAPI spec | `lib/api-spec/` (source of truth for codegen) |
| Generated hooks | `lib/api-client-react/src/generated/` |
| API routes | `artifacts/api-server/src/routes/` |
| Web pages | `artifacts/fitforge/src/pages/` |
| Web components | `artifacts/fitforge/src/components/` |
| Mobile screens | `artifacts/fitforge-mobile/app/` |
| Mobile components | `artifacts/fitforge-mobile/components/` |
| Mobile hooks | `artifacts/fitforge-mobile/hooks/` |
| Documentation | `docs/` |

## Architecture decisions

- **Orval codegen**: The OpenAPI spec in `lib/api-spec/` is the single source of truth. Never hand-write fetch calls — run `pnpm --filter @workspace/api-spec run codegen` after any spec change.
- **Offline caching (mobile)**: `useOfflinePlan` and `useOfflineWorkoutDay` implement live-first, cache-fallback via AsyncStorage. Cache keys are namespaced `liftiq:<feature>:<id>`. Cached state resets synchronously on ID change to prevent cross-item bleed.
- **Theme flash prevention**: A blocking inline `<script>` in `index.html` reads `liftiq-theme` from localStorage and applies the class before first paint. This script must be updated in lockstep with the `THEMES` constant in `settings.tsx`.
- **App name**: "LiftIQ AI" everywhere user-facing. Storage key `liftiq-theme` and UTM param `utm_source=liftiq` intentionally left unchanged.
- **Swap exercise**: Session-only in both web and mobile — swaps are never persisted to the server.

## Product

- **AI workout plans** — GPT-4o generates personalised resistance programs based on the user's goal, experience, and schedule
- **Active workout tracker** — set-by-set logging with rest timers, exercise swapping ("Machine Busy?"), and real-time progress counter
- **Strength progress charts** — estimated 1RM trend lines per exercise (web + mobile)
- **Workout celebration** — confetti burst + random motivational message on completion, then shareable summary card
- **DEXA scan parsing** — upload a DEXA PDF; AI extracts body-fat %, lean mass, visceral fat level
- **AI check-in coaching** — submit mood/energy/adherence; AI returns personalised coach feedback
- **AI diet recommendations** — GPT-4o generates a structured 7-day meal plan with macros
- **Offline workout access (mobile)** — AsyncStorage cache keeps plan and workout-day data accessible without internet
- **Stripe subscriptions** — Free tier for basic logging; Pro tier for all AI features

## User preferences

- Doc files in `docs/` must be updated as part of every feature task — treat outdated docs as a bug. See `docs/UPDATING-DOCS.md` for the checklist.

## Gotchas

- `useGetActivePlan({})` — takes an empty object param (not zero args); orval-generated hooks use positional params, mutations use `{ data }` or `{ sessionId, data }`.
- Mobile: `@react-native-async-storage/async-storage` is already in package.json — do not add it again.
- Stripe: currently in test mode. See `docs/billing-subscriptions.md` for go-live checklist.
- `relation "stripe.accounts" does not exist` on API boot — non-fatal, Stripe falls back to REST API. Pre-existing known issue.

## Pointers

- Full feature documentation: `docs/README.md`
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
