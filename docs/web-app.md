# Web App — LiftIQ AI

The web app (`artifacts/fitforge`) is a React + Vite single-page application. All routes are client-side; Wouter handles routing.

## Authentication

On startup `App.tsx` calls `GET /api/auth/check`. If the response is `{ authenticated: false }` the `<AuthGate>` component renders the **Login** page instead of the main app; once the user successfully logs in the check is re-fetched and the app renders.

The browser session is managed via an `httpOnly` secure cookie set by `POST /api/auth/login` — no credentials are stored in JavaScript or the JS bundle. The session is re-checked every 5 minutes; on expiry the user is redirected back to the login screen automatically.

---

## Pages

### Dashboard `/`
The home screen shown after login.

- **Training streak** — consecutive days with at least one completed session
- **Today's workout card** — pulls the active plan's recommended day; tapping navigates to the Day Detail
- **Stats strip** — total sessions, total sets logged, current plan name
- **Quick-action links** — New check-in, View progress, Diet plan
- **Upcoming days** — next 2–3 workout days with focus labels

---

### Onboarding `/onboarding`
First-run wizard for new users.

- Collects: fitness goal (muscle gain / fat loss / strength / endurance), experience level (beginner / intermediate / advanced), days available per week, current weight and height
- Saves to `user_profiles` via `POST /api/profile`
- Redirects to `/plan` and auto-triggers AI plan generation on completion

---

### Plan `/plan`
Displays the currently active training plan and allows generating a new one.

- **Plan card** — name, type label (Push/Pull/Legs, Full Body, Upper/Lower), AI coach notes
- **Training day list** — each day shows day number, label (e.g. "Push A"), focus, and exercise count
- **Generate new plan** button — calls `POST /api/plans/generate`; gated behind Pro subscription
- Each day card links to **Day Detail**

---

### Day Detail `/day/:id`
Pre-workout overview of a specific training day.

- Exercise list with muscle group, equipment, and prescribed sets × reps × weight
- **"Start Workout"** button navigates to Active Workout
- Read-only — no logging happens here

---

### Active Workout `/workout/:id`
Real-time workout tracker. One exercise shown at a time.

- **Exercise card** — name, muscle group, equipment badge, AI notes if present
- **Set rows** — target reps range + target weight; editable actual reps and weight fields
- **Log Set button** — calls `POST /api/sessions/:id/sets`; marks set done with a green check
- **Rest timer** — countdown shown between sets; auto-starts after each logged set
- **Machine Busy? / Swap** — opens the Swap Exercise Modal to replace the current exercise
  - Swap is session-only and never persisted
  - "SWAPPED" badge and struck-through original name shown while swapped
- **Previous / Next** arrows step through all exercises in the day
- **Finish Workout** — calls `PATCH /api/sessions/:id` with `completedAt`; triggers the celebration flow
- **Workout Celebration screen** — full-screen dark overlay with random motivational message (20-item pool), `canvas-confetti` burst in accent colour, "SEE MY STATS →" button
- **Workout Summary Modal** — duration, sets logged, highest weight lifted, PRs, per-exercise max; share buttons (X/Twitter, Facebook, Instagram, native OS share, copy text, download PNG card)

---

### History `/history`
Log of all completed workout sessions.

- Reverse-chronological list; each row shows date, day label, duration, set count
- **Session share button** per row — lazy-fetches full session detail on first click, opens Workout Summary Modal
- Heading styled as `COMBAT LOG`

---

### Progress `/progress`
Strength-gain and body-composition charts.

- **Exercise strength chart** — estimated 1RM trend over time (Epley formula); exercise picker dropdown; empty-state with prompt to log sets
- **DEXA body composition section** — body fat %, lean mass lbs, visceral fat level charts over time; data sourced from DEXA scan uploads
- All charts use Recharts with themed colours

---

### DEXA `/dexa`
Upload and manage DEXA scan reports.

- **Upload PDF** — sends to `POST /api/dexa-scans/parse`; AI extracts body fat %, lean mass, visceral fat, scan date from the PDF text
- **Scan history table** — date, body fat %, lean mass lbs, visceral fat level
- **Delete scan** — removes a scan record
- Affiliate provider cards (for finding a DEXA scan location)

---

### Check-in `/checkin`
Daily or weekly subjective check-in.

- Form fields: current weight, mood (1–5), energy (1–5), adherence %, free-text notes
- Submits to `POST /api/checkins`; server triggers AI feedback response
- **Check-in history** — list of past check-ins with AI response shown inline

---

### Diet `/diet`
AI-generated nutrition guidance.

- **Dietary preferences form** — goal (bulk / cut / maintain), dietary restrictions, calorie target
- **Generate recommendations** — calls `GET /api/diet/recommendations`; returns a structured meal plan and macro targets
- Recommendations displayed in card format per meal + daily totals

---

### Library `/library`
Searchable exercise database.

- Search by name or muscle group
- Each exercise card shows name, muscle group, equipment, and full instructions
- No authentication required — publicly accessible

---

### Pricing `/pricing`
Subscription plans and checkout.

- Free tier vs. Pro tier feature comparison table
- **Subscribe** button — calls `POST /api/stripe/checkout`; redirects to Stripe Checkout
- **Manage subscription** — opens Stripe Billing Portal for existing subscribers
- Post-checkout success page at `/checkout/success`

---

### Settings `/settings`
User profile and preferences.

- Edit display name, weight, height, fitness goal, experience level, days per week
- **Theme / accent colour picker** — 6 preset accent colours; persisted to `localStorage` as `liftiq-theme`; applied via CSS custom properties on `:root`
- **Account section** — subscription status badge, link to billing portal

---

## Global components

### Sidebar navigation
- Logo wordmark: `LIFT` (white) + `IQ AI` (green)
- Links: Dashboard, Plan, Active Workout, History, Progress, DEXA, Check-in, Diet, Library, Settings, Pricing
- Subscription status chip at the bottom
- Collapses to icon-only on narrow viewports

### Subscription gating
- Pro-only features (AI plan generation, AI diet, AI check-in feedback) show a lock overlay and redirect to `/pricing` when accessed on the Free tier
- Status fetched from `GET /api/stripe/status` on app mount

### Theme system
- Six accent colours stored in `localStorage`
- A blocking `<script>` in `index.html` reads the stored value and applies it before first paint to prevent flash
- See [Theming](./theming.md) for full details
