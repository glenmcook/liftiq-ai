# API Reference

Base URL (development): `http://localhost:5000/api`  
All endpoints return JSON.

---

## Authentication

All `/api/*` routes require authentication **except**:

| Path | Why it's public |
|---|---|
| `GET /api/healthz` | Public health check |
| `POST /api/auth/login` | Must be reachable before a session exists |
| `GET /api/auth/check` | Must be reachable before a session exists |
| `POST /api/stripe/webhook` | Protected by Stripe signature verification |

### `POST /api/auth/login`
Authenticates the caller with the server-side password (`ADMIN_PASSWORD` secret).

**Body**
```json
{ "password": "..." }
```

**Response (200)**  
Web callers receive an `httpOnly` session cookie automatically. Mobile callers additionally receive an opaque bearer token:
```json
{ "ok": true, "token": "<opaque>" }
```

**Errors**: `401 Incorrect password`, `400 Password is required`, `503 Authentication is not configured`

---

### `GET /api/auth/check`
Returns whether the current session/token is authenticated.

**Response**
```json
{ "authenticated": true }
```

---

### `POST /api/auth/logout`
Clears the caller's session cookie (web) and revokes the caller's bearer token (mobile). **Requires authentication** — unauthenticated callers receive 401. Only the calling client's token is revoked; other active sessions are left intact.

**Response**: `204 No Content`

---

### Sending the bearer token (mobile)
Mobile clients should store the token returned by `/api/auth/login` in AsyncStorage and supply it on every request via the `Authorization` header:

```
Authorization: Bearer <token>
```

The `setAuthTokenGetter` helper from `@workspace/api-client-react` wires this automatically into `customFetch`.

---

## Profile

### `GET /api/profile`
Returns the authenticated user's profile.

**Response**
```json
{
  "id": 1,
  "displayName": "Alex",
  "weightLbs": 185,
  "heightIn": 71,
  "age": 28,
  "fitnessGoal": "muscle_gain",
  "experienceLevel": "intermediate",
  "daysPerWeek": 4
}
```

### `POST /api/profile`
Creates or updates the user's profile.

**Body** — any subset of profile fields (all optional on update):
```json
{
  "weightLbs": 185,
  "heightIn": 71,
  "age": 28,
  "fitnessGoal": "muscle_gain",
  "experienceLevel": "intermediate",
  "daysPerWeek": 4
}
```

---

## Plans

### `GET /api/plans`
Lists all workout plans for the authenticated user.

### `GET /api/plans/active`
Returns the currently active plan with its days and exercise groups.

**Response shape**
```json
{
  "id": 3,
  "name": "PPL Hypertrophy",
  "planType": "ppl",
  "isActive": true,
  "aiNotes": "Focus on progressive overload...",
  "days": [
    {
      "id": 9,
      "dayNumber": 1,
      "label": "Push A",
      "focus": "Chest / Shoulders / Triceps",
      "restSeconds": 90
    }
  ]
}
```

### `GET /api/plans/:planId`
Returns a specific plan with full day and exercise detail.

### `POST /api/plans/generate`
Triggers AI generation of a new personalised plan.  
Uses the user's profile (goal, experience, days per week) as context.  
**Pro subscription required.**

**Response** — the newly created plan object (same shape as `GET /api/plans/active`).

---

## Workout Days

### `GET /api/days/:dayId`
Returns a workout day with full exercise groups and prescribed sets.

**Response shape**
```json
{
  "id": 9,
  "dayNumber": 1,
  "label": "Push A",
  "focus": "Chest / Shoulders / Triceps",
  "restSeconds": 90,
  "exerciseGroups": [
    {
      "groupName": "Chest",
      "pickOne": false,
      "exercises": [
        {
          "id": 42,
          "exerciseId": 7,
          "exercise": {
            "id": 7,
            "name": "Barbell Bench Press",
            "muscleGroup": "chest",
            "equipment": "barbell"
          },
          "prescribedSets": [
            {
              "id": 101,
              "setNumber": 1,
              "targetRepsMin": 8,
              "targetRepsMax": 12,
              "targetWeightLbs": 135,
              "restSeconds": 90
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Sessions

### `GET /api/sessions`
Lists completed and in-progress sessions for the authenticated user (reverse chronological).

### `POST /api/sessions`
Starts a new session.

**Body**
```json
{ "dayId": 9 }
```

**Response** — the new session object with `id`, `dayId`, `startedAt`, `completedAt: null`.

### `GET /api/sessions/:sessionId`
Returns a session with all its logged sets.

### `PATCH /api/sessions/:sessionId`
Updates a session — used to mark it complete.

**Body**
```json
{ "completedAt": "2026-07-20T10:30:00.000Z" }
```

### `POST /api/sessions/:sessionId/sets`
Logs a completed set.

**Body**
```json
{
  "exerciseId": 7,
  "setNumber": 1,
  "actualReps": 10,
  "actualWeightLbs": 140
}
```

**Response** — the logged set record, including `isPersonalRecord: true/false`.

---

## Exercises

### `GET /api/exercises`
Lists all exercises. Supports optional query params:
- `muscleGroup` — filter by muscle group string
- `search` — substring search on name

### `GET /api/exercises/:id`
Returns a single exercise with full instructions.

### `GET /api/exercises/:id/alternates`
Returns exercises in the same muscle group, suitable for swapping.

---

## Exercise Maxes (PRs)

### `GET /api/exercise-maxes`
Returns the user's personal records across all exercises.

**Response** — array of `{ exerciseId, exerciseName, maxWeightLbs, achievedAt }`.

### `POST /api/exercise-maxes`
Manually records a personal best.

**Body**
```json
{ "exerciseId": 7, "maxWeightLbs": 225, "achievedAt": "2026-07-20T00:00:00.000Z" }
```

---

## Progress

### `GET /api/progress/weights`
Returns time-series data for estimated 1RM per exercise (used by strength charts).

**Query params**
- `exerciseId` (required) — exercise to chart

**Response** — array of `{ date: "2026-07-01", estimatedOneRepMax: 185 }`.

---

## DEXA Scans

### `GET /api/dexa-scans`
Lists the user's DEXA scan records.

### `POST /api/dexa-scans/parse`
Uploads a DEXA PDF and extracts body composition data using AI.

**Request** — `multipart/form-data` with a `file` field.

**Response**
```json
{
  "id": 5,
  "scanDate": "2026-06-15",
  "bodyFatPercent": 18.2,
  "leanMassLbs": 151.4,
  "visceralFatLevel": 4
}
```

### `DELETE /api/dexa-scans/:id`
Deletes a scan record.

---

## Check-ins

### `GET /api/checkins`
Lists all check-ins for the user.

### `POST /api/checkins`
Submits a new check-in. The server generates an AI feedback response.  
**Pro subscription required for AI feedback.**

**Body**
```json
{
  "weightLbs": 184,
  "mood": 4,
  "energy": 3,
  "adherencePercent": 85,
  "notes": "Felt strong today, sleep was good."
}
```

**Response** — the check-in record including `aiResponse` text.

---

## Diet

### `GET /api/diet/preferences`
Returns the user's current dietary preferences.

### `POST /api/diet/preferences`
Saves dietary preferences.

**Body**
```json
{
  "goal": "bulk",
  "restrictions": ["gluten_free"],
  "targetCalories": 3200
}
```

### `GET /api/diet/recommendations`
Returns AI-generated meal plan and macro targets based on stored preferences.  
**Pro subscription required.**

---

## Dashboard

### `GET /api/dashboard/summary`
Aggregates key metrics for the home screen.

**Response**
```json
{
  "currentStreak": 4,
  "totalSessions": 31,
  "sessionsThisWeek": 3,
  "totalSets": 412,
  "activePlanName": "PPL Hypertrophy",
  "nextWorkoutLabel": "Pull A"
}
```

---

## Billing (Stripe)

### `GET /api/stripe/status`
Returns the current subscription state.

**Response**
```json
{
  "isPro": true,
  "plan": "Pro",
  "currentPeriodEnd": "2026-08-20T00:00:00.000Z"
}
```

### `POST /api/stripe/checkout`
Creates a Stripe Checkout session and returns the redirect URL.

**Body**
```json
{ "priceId": "price_xxx" }
```

### `POST /api/stripe/portal`
Creates a Stripe Billing Portal session for managing / cancelling a subscription.

### `POST /api/stripe/webhook`
Stripe webhook handler (internal — not called by clients). Processes `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
