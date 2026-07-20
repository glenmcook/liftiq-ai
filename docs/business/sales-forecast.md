# LiftIQ AI — Sales Forecast
**Confidential | July 2026**

---

## Assumptions

| Assumption | Value | Notes |
|---|---|---|
| Monthly Pro price | $12.99 | Current live price |
| Annual Pro price | $108.00 | = $9.00/month effective |
| Annual subscriber mix | 30% of Pro subscribers | Estimate; grows as trust builds |
| Blended ARPU (monthly) | ~$11.50 | Weighted avg of monthly + annual |
| Free trial length | 7 days | No revenue during trial |
| Free-to-paid conversion | 8% (Month 1) → 20% (Month 12) | Improves as onboarding is tuned |
| Monthly churn | 7% (Month 1) → 4% (Month 12) | Improves as product matures |
| OpenAI cost per Pro user | $1.00/month | Estimated based on avg AI usage |
| Stripe fees | 2.9% + $0.30/transaction | Standard Stripe rate |
| Gross margin | ~88% at scale | After API and payment costs |

---

## Monthly Subscriber Forecast (Months 1–18)

| Month | New Free Sign-ups | New Pro Trials | New Paid Pro | Churned | Net Pro Subs | Cumulative Pro |
|---|---|---|---|---|---|---|
| 1 | 150 | 30 | 12 | 0 | 12 | 12 |
| 2 | 200 | 40 | 20 | 1 | 19 | 31 |
| 3 | 300 | 60 | 30 | 2 | 28 | 59 |
| 4 | 400 | 80 | 40 | 4 | 36 | 95 |
| 5 | 500 | 100 | 55 | 6 | 49 | 144 |
| 6 | 600 | 120 | 65 | 9 | 56 | 200 |
| 7 | 700 | 140 | 75 | 12 | 63 | 263 |
| 8 | 800 | 160 | 85 | 15 | 70 | 333 |
| 9 | 900 | 180 | 95 | 19 | 76 | 409 |
| 10 | 1,000 | 200 | 110 | 24 | 86 | 495 |
| 11 | 1,100 | 220 | 120 | 28 | 92 | 587 |
| 12 | 1,200 | 240 | 135 | 33 | 102 | 689 |
| 13 | 1,300 | 260 | 150 | 38 | 112 | 801 |
| 14 | 1,400 | 280 | 165 | 44 | 121 | 922 |
| 15 | 1,500 | 300 | 180 | 51 | 129 | 1,051 |
| 16 | 1,600 | 320 | 195 | 58 | 137 | 1,188 |
| 17 | 1,700 | 340 | 210 | 65 | 145 | 1,333 |
| 18 | 1,800 | 360 | 230 | 73 | 157 | 1,490 |

---

## Monthly Revenue Forecast (MRR)

Blended ARPU = $11.50/month (accounts for 30% of subscribers on annual plan paying $9/month effective)

| Month | Cumulative Pro Subs | MRR | ARR Run Rate |
|---|---|---|---|
| 1 | 12 | $138 | $1,656 |
| 2 | 31 | $357 | $4,278 |
| 3 | 59 | $679 | $8,142 |
| 4 | 95 | $1,093 | $13,110 |
| 5 | 144 | $1,656 | $19,872 |
| 6 | 200 | $2,300 | $27,600 |
| 7 | 263 | $3,025 | $36,294 |
| 8 | 333 | $3,830 | $45,954 |
| 9 | 409 | $4,704 | $56,442 |
| 10 | 495 | $5,693 | $68,310 |
| 11 | 587 | $6,751 | $81,006 |
| 12 | 689 | $7,924 | $95,082 |
| 13 | 801 | $9,212 | $110,538 |
| 14 | 922 | $10,603 | $127,236 |
| 15 | 1,051 | $12,087 | $145,038 |
| 16 | 1,188 | $13,662 | $163,944 |
| 17 | 1,333 | $15,330 | $183,954 |
| 18 | 1,490 | $17,135 | $205,620 |

---

## Key Milestones

| Milestone | Projected Month |
|---|---|
| First paying subscriber | Month 1 |
| Break-even (solo operating costs) | Month 4 (~150 subscribers) |
| $1,000 MRR | Month 5 |
| $5,000 MRR | Month 10 |
| 500 Pro subscribers | Month 10 |
| $10,000 MRR | Month 13 |
| 1,000 Pro subscribers | Month 15 |
| $15,000 MRR | Month 15 |
| $200,000 ARR run rate | Month 18 |

---

## Revenue by Year

### Year 1 (Months 1–12)
- **Cumulative new Pro subscribers:** 689
- **Total MRR at end of year:** $7,924
- **Estimated Year 1 total revenue:** ~$38,500
  - *(Sum of monthly MRR across 12 months + annual plan upfront payments)*

### Year 2 (Months 13–24, extrapolated)
- **Projected subscriber count at Month 24:** ~2,200
- **Projected MRR at Month 24:** ~$25,300
- **Estimated Year 2 total revenue:** ~$210,000

### Year 3 (stretch target)
- **Projected subscriber count:** 5,000+
- **Projected ARR:** ~$690,000
- **Assumes:** B2B / gym partnerships contributing 15–20% of revenue

---

## Cost Structure

### Variable Costs (scale with users)

| Cost | Rate | Per 1,000 Pro Users/Month |
|---|---|---|
| OpenAI API (plan gen, check-in, diet, DEXA) | ~$1.00/user/month | $1,000 |
| Stripe processing fees | ~2.9% + $0.30/txn | ~$375 |
| Hosting / infrastructure | ~$0.05/user/month | $50 |
| **Total variable** | | **~$1,425** |

### Fixed Costs (monthly estimates)

| Cost | Monthly |
|---|---|
| Hosting (Replit / servers) | $50–100 |
| Domain & SSL | $5 |
| Email service (onboarding flows) | $30–80 |
| Analytics & monitoring | $20–50 |
| **Total fixed** | **~$105–235** |

### Gross Margin at Scale

At 1,000 Pro subscribers:
- **MRR:** ~$11,500
- **Variable costs:** ~$1,425
- **Fixed costs:** ~$170
- **Gross profit:** ~$9,905
- **Gross margin:** ~**86%**

---

## Scenario Analysis

### Conservative (50% of base case)
*Slower organic growth, lower conversion*

| Month 12 | Month 18 |
|---|---|
| 345 Pro subscribers | 745 Pro subscribers |
| $3,967 MRR | $8,568 MRR |

### Base Case (forecast above)
| Month 12 | Month 18 |
|---|---|
| 689 Pro subscribers | 1,490 Pro subscribers |
| $7,924 MRR | $17,135 MRR |

### Optimistic (1 viral moment or major creator partnership)
*One creator or Product Hunt launch drives a spike*

| Month 12 | Month 18 |
|---|---|
| 1,200 Pro subscribers | 2,800 Pro subscribers |
| $13,800 MRR | $32,200 MRR |

---

## Break-Even Analysis

Monthly fixed cost of operating solo (no salary): ~$200–300/month

**Break-even:** ~27 Pro subscribers at $11.50 ARPU covers all fixed costs.

At the current growth trajectory, **break-even is reached in Month 2–3**.

If paying yourself a modest salary of $4,000/month:
**Break-even:** ~$4,200/month total costs → ~365 subscribers → projected **Month 7**.
