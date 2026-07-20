# LiftIQ AI — Documentation

LiftIQ AI is an AI-powered personal training platform: a React + Vite web app, an Expo React Native mobile app, and an Express 5 API server backed by PostgreSQL.

---

## Contents

| Document | What it covers |
|---|---|
| [Web App](./web-app.md) | Every page, feature, and UI flow in the browser app |
| [Mobile App](./mobile-app.md) | Every screen, component, and flow in the Expo app |
| [API Reference](./api-reference.md) | All REST endpoints, request/response shapes |
| [Data Model](./data-model.md) | PostgreSQL schema, table-by-table |
| [AI Features](./ai-features.md) | Every OpenAI-powered capability |
| [Billing & Subscriptions](./billing-subscriptions.md) | Stripe integration, plans, gating |
| [Offline Support](./offline-support.md) | AsyncStorage caching strategy on mobile |
| [Theming](./theming.md) | Theme system, accent colours, flash prevention |
| [Keeping Docs Current](./UPDATING-DOCS.md) | How to update this documentation when adding features |

---

## Architecture at a glance

```
Browser / Mobile
      │
      ▼
artifacts/fitforge          React + Vite SPA (web)
artifacts/fitforge-mobile   Expo React Native (iOS / Android)
      │
      ▼ REST
artifacts/api-server        Express 5 API  (:5000)
      │
      ▼
lib/db                      Drizzle ORM + PostgreSQL
lib/api-spec                OpenAPI spec (source of truth for codegen)
lib/api-client-react        Orval-generated React Query hooks
```

### Shared libraries

| Package | Purpose |
|---|---|
| `@workspace/db` | Drizzle schema, migrations, query helpers |
| `@workspace/api-spec` | OpenAPI YAML + Orval codegen config |
| `@workspace/api-client-react` | Generated hooks + Zod schemas consumed by both apps |

---

## Running locally

```bash
# API server
pnpm --filter @workspace/api-server run dev

# Web app
pnpm --filter @workspace/fitforge run dev

# Mobile app
pnpm --filter @workspace/fitforge-mobile run dev

# Regenerate API hooks after spec changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Full typecheck
pnpm run typecheck
```

Required environment variable: `DATABASE_URL` (Postgres connection string).
