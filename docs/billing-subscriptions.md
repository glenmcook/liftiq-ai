# Billing & Subscriptions

LiftIQ AI uses Stripe for subscription billing. The Stripe integration is managed via Replit's native Stripe connector.

---

## Plans

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 / month | Exercise library, manual workout logging, history, basic progress charts |
| **Pro** | Configured in Stripe Dashboard | Everything in Free + AI plan generation, AI check-in feedback, AI diet recommendations, DEXA scan parsing |

---

## Architecture

```
Client                API Server              Stripe
  │                       │                     │
  │  POST /stripe/checkout │                     │
  ├──────────────────────►│                     │
  │                       │  Create checkout    │
  │                       ├────────────────────►│
  │                       │◄────────────────────┤
  │◄──────────────────────┤  { url }            │
  │                       │                     │
  │  Redirect to Stripe   │                     │
  ├──────────────────────────────────────────►  │
  │                       │                     │
  │  (payment complete)   │  webhook event      │
  │                       │◄────────────────────┤
  │                       │  set is_pro=true    │
  │                       ▼                     │
  │                   database                  │
```

---

## Key endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/stripe/status` | Returns `{ isPro, plan, currentPeriodEnd }` — called on app mount to gate features |
| `POST /api/stripe/checkout` | Creates a Checkout session; body: `{ priceId }` |
| `POST /api/stripe/portal` | Creates a Billing Portal session for subscription management |
| `POST /api/stripe/webhook` | Receives Stripe events (must be registered in Stripe Dashboard) |

---

## Webhook events handled

| Event | Action |
|---|---|
| `checkout.session.completed` | Sets `is_pro = true`, stores `stripe_customer_id` and `stripe_subscription_id` |
| `customer.subscription.updated` | Updates subscription status |
| `customer.subscription.deleted` | Sets `is_pro = false` |

---

## Feature gating

The `requirePro` middleware in `artifacts/api-server/src/middleware/` reads `is_pro` from the user's session and returns `403` for Pro-only endpoints.

On the web app, Pro-only UI sections check the `stripe/status` query result and display a lock overlay with a link to `/pricing` when the user is on the Free tier.

---

## Going live checklist

1. Replace the `STRIPE_SECRET_KEY` secret with the live key (currently test mode)
2. Create live Products and Prices in the Stripe Dashboard
3. Update the `priceId` values in the frontend pricing page
4. Register the webhook endpoint (`POST /api/stripe/webhook`) in the Stripe Dashboard with the live signing secret
5. Add `STRIPE_WEBHOOK_SECRET` as a secret in Replit
