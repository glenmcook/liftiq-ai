# LiftIQ AI — Marketing Strategy
**Confidential | July 2026**

---

## Overview

LiftIQ AI's marketing strategy focuses on capturing high-intent gym-goers through organic search, fitness creator partnerships, and community-led growth — before investing in paid acquisition. The goal is to reach 2,000 paying subscribers within 15 months with minimal ad spend.

**Core positioning:** The AI personal trainer for serious gym-goers who can't afford (or don't want) a real trainer.

**Value proposition in one sentence:**
> LiftIQ AI builds your training plan, tracks your lifts, coaches your check-ins, and plans your nutrition — for less than one session with a personal trainer per month.

---

## 1. Target Audience

### Primary Persona — "The Frustrated Self-Programmer"
- Age: 24–38, male or female
- Trains 3–5x per week, has been lifting 1–4 years
- Has tried free programs (Reddit PPL, PHUL, etc.) but doesn't know how to adapt them
- Tracks progress sporadically — maybe a notes app or Hevy
- Would consider a trainer but finds it unaffordable or inconvenient
- **Trigger:** Hit a plateau, starting a cut, or preparing for an event

### Secondary Persona — "The Metrics Nerd"
- Age: 28–45
- Already tracks everything obsessively — calories, sleep, HRV
- Gets DEXA scans 1–2x per year
- Wants to close the loop between body composition data and training
- **Trigger:** Gets a DEXA scan, wants a platform to track it over time

### Channels Where They Spend Time
- Reddit (r/Fitness, r/bodybuilding, r/leangains, r/naturalbodybuilding)
- YouTube (lifting technique, program reviews, physique transformations)
- Instagram (fitness accounts, physique content, supplement brands)
- TikTok (quick workout tips, transformation videos)
- X/Twitter (fitness discourse, training philosophy)

---

## 2. Marketing Pillars

### Pillar 1: SEO & Content Marketing

**Goal:** Rank for high-intent keywords within 6 months, driving 5,000+ organic visits/month by Q1 2027.

**Priority keyword clusters:**

| Cluster | Example Keywords | Intent |
|---|---|---|
| AI training | "AI workout plan generator", "best AI personal trainer app" | High |
| Program types | "push pull legs program for beginners", "upper lower split 4 days" | High |
| DEXA | "how to read DEXA scan results", "DEXA scan body fat percentage" | High |
| Strength tracking | "how to track progressive overload", "1RM calculator" | Medium |
| Comparison | "Hevy vs LiftIQ", "Fitbod alternative", "Strong app alternative" | High |

**Content formats:**
- Long-form guides (2,000–4,000 words) targeting informational keywords
- Comparison pages targeting "X vs Y" and "X alternative" searches
- Free tools (1RM calculator, macro calculator) as link magnets
- "How to read your DEXA scan" — targets the secondary persona perfectly

**Publishing cadence:** 2 articles per week for the first 6 months.

---

### Pillar 2: Fitness Creator Partnerships

**Goal:** 3–5 active creator partnerships by Month 4, each driving 50–200 sign-ups.

**Creator profile:**
- 10,000–200,000 followers (micro to mid-tier performs better for niche fitness)
- Focus: natty lifting, strength training, powerbuilding, physique
- Audience overlaps with primary persona
- Authentic — they actually train and care about programming

**Partnership structure:**
- **Option A — Affiliate:** 20–30% recurring commission on referred Pro subscribers for the lifetime of the subscription. No upfront cost.
- **Option B — Paid sponsorship:** Flat fee ($200–800 depending on reach) + 15% affiliate for conversion tracking. For creators with highly engaged audiences.

**Outreach approach:**
1. DM or email with a personalised note referencing specific content they've made
2. Offer a free Pro account so they actually use the product before promoting it
3. Provide a unique referral link and monthly performance reports
4. Give them a custom landing page with their name/brand ("Built by [Creator] × LiftIQ AI")

**Platforms:** Instagram and YouTube first. TikTok in Month 4+.

---

### Pillar 3: Community & Reddit

**Goal:** Establish genuine presence in fitness communities. No spammy posts.

**Strategy:**
- Founder-led authentic participation in r/Fitness, r/bodybuilding, r/leangains
- Answer questions genuinely — only mention LiftIQ when directly relevant
- Share progress updates, learnings, and behind-the-scenes on r/indiehackers and r/SaaS for secondary audience (builders and early adopters)
- Post genuinely useful content (e.g., "I analysed 1,000 DEXA scans and here's what the data shows") with LiftIQ as the tool

**Launch strategy:**
- Post a "Show HN" on Hacker News and a launch post on r/Fitness and r/indiehackers
- Product Hunt launch — target Top 5 of the day for fitness category

---

### Pillar 4: DEXA Clinic Partnerships

**Goal:** 5–10 DEXA clinic referral arrangements by Month 6.

**Rationale:** People who get DEXA scans are highly motivated and have money to spend on health. LiftIQ's DEXA parsing feature is unique and immediately valuable post-scan.

**Approach:**
- Contact clinic managers at DEXA/body composition scan centres (DexaFit, BodySpec, independent clinics)
- Offer them a co-branded landing page: "Got your DEXA scan? Import it into LiftIQ AI in 30 seconds."
- Revenue share or flat referral fee ($5–10 per converted Pro subscriber)
- Patient materials (QR card, email template) they can give to clients post-scan

---

### Pillar 5: Referral Program

**Goal:** Launch by Month 5. Drive 15–20% of new subscribers from referrals.

**Mechanics:**
- Every Pro subscriber gets a unique referral link
- Referrer earns: 1 free month for every 3 successful referrals
- Referred friend earns: 14-day free trial instead of 7-day (extended trial as incentive)
- In-app referral prompt appears after first completed workout and after every PR

**Tracking:** Stripe metadata + referral code in the checkout URL.

---

## 3. Paid Acquisition (Month 6+)

Defer paid ads until organic is validated and conversion rates are understood.

**When to start:** Once MRR > $3,000 and free-to-paid conversion rate is measured over 30 days.

**Channels:**
1. **Meta (Instagram/Facebook) ads** — targeting gym-goers, fitness app users, personal training interest. Lookalike audiences from email list.
2. **YouTube pre-roll** — target viewers of specific workout channels. 15-second non-skippable format focused on the "AI trainer at 1/10th the cost" hook.
3. **Google Search** — bid on competitor brand terms (Hevy, Fitbod, Strong app) and high-intent queries ("AI personal trainer app").

**Target CAC:** Under $25. At $12.99/month with ~12-month average LTV, this gives >6x LTV:CAC ratio.

---

## 4. Retention Marketing

Acquiring subscribers is half the job. Keeping them is the other half.

**In-app triggers (to be built):**
- Streak notifications: "You haven't logged a session in 5 days"
- PR celebrations pushed to mobile
- Weekly AI check-in reminder

**Email sequences:**
1. **Onboarding (Days 1–7):** Welcome → First workout guide → How to use AI check-in → DEXA feature explanation → Trial ending reminder
2. **Ongoing (monthly):** New feature announcements, training tips, PR highlights
3. **Win-back (after 30 days inactive):** "Your plan is still waiting" + offer an extended trial or discount

**Churn indicators to monitor:**
- No session logged in 14 days
- No AI check-in in 30 days
- Opened pricing page without converting

---

## 5. Brand Guidelines

**Voice:** Direct, confident, knowledgeable — but not bro-y or cringe. LiftIQ talks like a knowledgeable training partner, not a supplement ad.

**Tone words:** Precise, honest, performance-driven, intelligent

**Avoid:** Hype language ("CRUSH your goals!"), generic fitness clichés, stock gym imagery with models who clearly don't lift

**Visual identity:** Dark background, green accent (#39FF14), monospace font details, data-forward aesthetic. Think Bloomberg Terminal meets elite fitness.

---

## 6. KPIs & Metrics

| Metric | Month 3 Target | Month 6 Target | Month 12 Target |
|---|---|---|---|
| Monthly website visitors | 2,000 | 8,000 | 25,000 |
| Free sign-ups (cumulative) | 400 | 1,500 | 6,000 |
| Pro subscribers | 100 | 400 | 1,200 |
| Free-to-paid conversion | 10% | 15% | 20% |
| Monthly churn | < 8% | < 6% | < 5% |
| MRR | $1,299 | $5,196 | $15,588 |
| CAC (organic) | $8 | $6 | $5 |
| Active creator partnerships | 1 | 4 | 8 |
