# LiftIQ AI — Business Plan
**Confidential | July 2026**

---

## Executive Summary

LiftIQ AI is an AI-powered personal training platform that delivers professional-grade coaching to anyone with a smartphone — without the $200/hour trainer fee. The platform combines structured strength programming, real-time workout logging, body composition tracking, and AI coaching across web and iOS/Android apps.

**The core offer:** An AI that writes your training plan, coaches your check-ins, plans your nutrition, and tracks every PR you hit — for $12.99/month.

**Status:** Product is built and live. Revenue infrastructure (Stripe) is integrated. Now in go-to-market phase.

**Goal (Year 1):** 2,000 paying Pro subscribers at $12.99/month = ~$311,760 ARR.

---

## 1. Problem

Personal training is expensive, inconsistent, and inaccessible.

- A qualified personal trainer costs $60–$200 per session
- Most gym-goers either train without a plan or use generic YouTube programs not designed for them
- Tracking progress is manual, fragmented across spreadsheets and notes apps
- Nutrition and recovery advice is siloed from training data — no one product connects them

**The result:** People go to the gym, work hard, and make slow or no progress because they lack structure, accountability, and feedback.

---

## 2. Solution

LiftIQ AI solves all four gaps in one product:

| Gap | LiftIQ Feature |
|---|---|
| No structured plan | AI generates a personalised Push/Pull/Legs, Full Body, or Upper/Lower program in 15 seconds |
| No progress tracking | Every set logged; strength charts and PR history built automatically |
| No nutrition guidance | AI writes a 7-day macro-targeted meal plan on demand |
| No accountability | Weekly AI check-ins analyse training data and write personalised coach feedback |
| Expensive body comp tracking | DEXA scan PDFs parsed by AI — no manual data entry |

---

## 3. Product

### Web App
13 pages covering the full training lifecycle: Dashboard, Protocol (training plan), Active Workout, History, Progress charts, DEXA Scans, AI Check-in, Diet, Exercise Library, Recommendations, Pricing, and Docs.

### Mobile App (iOS + Android)
Native Expo app with the same core loop — plan, log, review — plus offline support, haptic feedback, and OS share sheet for workout sharing.

### Technology Stack
- **Frontend:** React + Vite (web), Expo React Native (mobile)
- **Backend:** Node.js/Express REST API
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4o (plan generation, check-in coaching, diet planning, DEXA parsing)
- **Payments:** Stripe (subscriptions, trials, billing portal)

---

## 4. Market

### Target Customer
**Primary:** Gym-going adults aged 22–42 who train 3–5 days per week, have tried free programs, and are frustrated by slow progress or lack of structure. They would consider a personal trainer but find it too expensive or inconvenient.

**Secondary:** Serious fitness enthusiasts who already track training and want AI-enhanced insights (DEXA trends, PR detection, check-in feedback).

### Market Size
- ~60 million gym members in the US alone
- Global fitness app market: $15.96 billion (2023), growing at ~17% CAGR
- AI fitness market specifically: $8.4 billion projected by 2027
- Serviceable addressable market (serious gym-goers who would pay for an AI coach): estimated 8–12 million people in English-speaking markets

### Competition

| Competitor | Price | Gap LiftIQ fills |
|---|---|---|
| Hevy | Free/$7 | No AI plan generation or coaching |
| Strong | $10/mo | No AI, no nutrition, no check-ins |
| Caliber | $150+/mo | AI coach but 10x the price, requires human review |
| Fitbod | $13/mo | AI exercise selection only, no full plan or nutrition |
| ChatGPT | $20/mo | General AI, not purpose-built; no logging or tracking |

**LiftIQ's position:** Purpose-built AI training + tracking + nutrition + body comp in one product, at a price anyone who goes to the gym can justify.

---

## 5. Revenue Model

### Pricing Tiers

**Free** — acquisition hook
- Dashboard, 3 sessions/month, limited library (50 exercises), history, progress charts
- Designed to let users experience the value before hitting the wall

**Pro — $12.99/month or ~$108/year (save 30%)**
- Unlimited logging, full library (500+ exercises)
- DEXA scan AI parsing
- AI plan generation (unlimited regenerations)
- AI check-ins and readiness scoring
- AI nutrition protocol
- Arsenal recommendations

**7-Day Free Trial** on all Pro plans — no credit card required at sign-up.

### Revenue Streams
1. **Subscription revenue** — core recurring revenue (MRR/ARR)
2. **Annual plan uplift** — annual subscribers pay ~$9.09/month effective, but pay upfront, improving cash flow
3. **Future: B2B / gym partnerships** — white-label or referral arrangements with gym chains and DEXA scan providers

---

## 6. Go-To-Market Strategy

See full Marketing Strategy document. Key pillars:

1. **SEO content** — "best AI workout plan", "DEXA scan results explained", "Push Pull Legs program" — capture high-intent search traffic
2. **Fitness creator partnerships** — Instagram/YouTube creators in the natty lifting and physique space
3. **Reddit/community** — organic presence in r/Fitness, r/bodybuilding, r/leangains
4. **Referral program** — existing subscribers refer friends for a discount or free month
5. **DEXA clinic partnerships** — clinics recommend LiftIQ to patients who want to act on their scan results

---

## 7. Operations

### Current Team
Solo founder / builder. The product is fully built.

### What Scales Without Headcount
- AI features (OpenAI API) — no human labour in the coaching loop
- Billing (Stripe) — self-serve checkout, portal, and webhooks
- Customer support (planned) — AI-assisted FAQ + ticketing

### Near-Term Hires (at 500+ subscribers)
- Part-time customer support / community manager
- Freelance content writer for SEO

---

## 8. Financial Summary

See full Sales Forecast document for monthly detail.

| Milestone | Target |
|---|---|
| 100 Pro subscribers | Month 3 |
| 500 Pro subscribers | Month 7 |
| 1,000 Pro subscribers | Month 10 |
| 2,000 Pro subscribers | Month 15 |
| Break-even (solo) | ~150 subscribers |

**Unit economics:**
- Average Revenue Per User (ARPU): ~$11.50/month (blended monthly + annual)
- OpenAI cost per active Pro user: ~$0.80–1.20/month
- Stripe fees: ~2.9% + $0.30 per transaction
- Gross margin at scale: ~88%

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| OpenAI price increase | Monitor usage, add caching for repeated plan types, explore open-source models |
| Low free-to-paid conversion | Tighten free tier further, improve upgrade prompts in-app |
| Large competitor copies the feature set | Speed to market, community moat, DEXA integration differentiation |
| App Store policy changes (mobile) | Web app is primary; mobile is supplementary |
| Churn from users hitting plateau | AI check-in feature directly addresses this — make it stickier |

---

## 10. Milestones

| Date | Milestone |
|---|---|
| Q3 2026 | Launch publicly, first 50 paid subscribers |
| Q4 2026 | 200 paid subscribers, first creator partnership live |
| Q1 2027 | 500 paid subscribers, SEO traffic > 5,000 visits/month |
| Q2 2027 | 1,000 paid subscribers, referral program launched |
| Q4 2027 | 2,000 paid subscribers, explore B2B / gym partnerships |
