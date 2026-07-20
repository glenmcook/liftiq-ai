# AI Features

LiftIQ AI uses OpenAI (via Replit's AI Integrations proxy) for four distinct features. The API key is provided by the `AI_INTEGRATIONS_OPENAI_API_KEY` secret; the base URL is `AI_INTEGRATIONS_OPENAI_BASE_URL`. Neither value is ever exposed to the client.

---

## 1. AI Workout Plan Generation

**Endpoint:** `POST /api/plans/generate`  
**Gating:** Pro subscription required  
**Model:** GPT-4o (or configured default)

### What it does
Generates a personalised multi-week resistance training program structured as a JSON object matching the app's plan schema. The program specifies days, exercise groups, prescribed sets, rep ranges, target weights, and coach notes.

### Inputs
The prompt is built from the user's `user_profiles` row:
- Fitness goal (`muscle_gain`, `fat_loss`, `strength`, `endurance`)
- Experience level (`beginner`, `intermediate`, `advanced`)
- Days per week
- Current weight and height (for weight-selection heuristics)

### Output
A fully-formed plan object that is immediately persisted and set as active. The previous active plan is deactivated.

---

## 2. DEXA Scan PDF Parsing

**Endpoint:** `POST /api/dexa-scans/parse`  
**Gating:** None (available on Free tier)  
**Model:** GPT-4o

### What it does
Accepts a DEXA scan PDF upload. The server extracts raw text from the PDF (`pdf-parse`), then passes it to the AI with a structured extraction prompt. The AI returns:
- Scan date
- Body fat percentage
- Lean mass (lbs)
- Visceral fat level (numeric scale)

The extracted values are saved to `dexa_scans` and returned to the client.

### Edge cases
- If the PDF text is ambiguous, the AI returns `null` for fields it cannot determine
- Raw text is stored alongside the extracted values for auditability

---

## 3. AI Check-in Feedback

**Endpoint:** `POST /api/checkins`  
**Gating:** Pro subscription required  
**Model:** GPT-4o

### What it does
After a user submits a check-in (mood, energy, adherence, weight, notes), the server sends the data along with the user's recent session history and current plan to the AI. The AI generates a short (3–5 sentence) personalised coach response that:
- Acknowledges the check-in metrics
- Highlights positives or flags concerns
- Gives one actionable suggestion

The response is stored in `checkins.ai_response` and displayed inline in the check-in history.

---

## 4. AI Diet Recommendations

**Endpoint:** `GET /api/diet/recommendations`  
**Gating:** Pro subscription required  
**Model:** GPT-4o

### What it does
Takes the user's `diet_profiles` row (goal, restrictions, calorie target) plus body weight and generates a structured 7-day meal plan with:
- Per-meal breakdown (breakfast, lunch, dinner, snacks)
- Calorie and macro targets per meal
- Total daily macros (protein, carbs, fat)
- Brief rationale tied to the user's goal

The plan is cached in `diet_recommendations` and served from cache until the user regenerates it.

---

## Adding a new AI feature

1. Add the endpoint in `artifacts/api-server/src/routes/`
2. Import `openai` from the shared AI client (already configured with the proxy base URL)
3. Gate Pro-only features with the `requirePro` middleware
4. Update the OpenAPI spec in `lib/api-spec/` and run `pnpm --filter @workspace/api-spec run codegen`
5. Add the feature to this document and to [web-app.md](./web-app.md) or [mobile-app.md](./mobile-app.md)
