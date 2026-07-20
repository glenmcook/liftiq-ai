# Data Model

Schema lives in `lib/db/src/schema/`. Drizzle ORM is used for all queries and migrations.

---

## `user_profiles`
One row per authenticated user.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | Auto-increment |
| `user_id` | text | Replit / OpenID user identifier — unique |
| `display_name` | text | |
| `weight_lbs` | numeric | Current body weight |
| `height_in` | integer | Height in inches |
| `age` | integer | |
| `fitness_goal` | text | `muscle_gain`, `fat_loss`, `strength`, `endurance` |
| `experience_level` | text | `beginner`, `intermediate`, `advanced` |
| `days_per_week` | integer | Training frequency preference |
| `stripe_customer_id` | text | Populated on first Stripe interaction |
| `stripe_subscription_id` | text | Active subscription ID |
| `is_pro` | boolean | Denormalised for fast gating checks |
| `created_at` | timestamp | |

---

## `workout_plans`
An AI-generated (or manually created) training program.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | text | FK → `user_profiles.user_id` |
| `name` | text | e.g. "PPL Hypertrophy" |
| `plan_type` | text | `ppl`, `full_body`, `upper_lower` |
| `is_active` | boolean | Only one plan can be active per user |
| `description` | text | Optional human-readable summary |
| `ai_notes` | text | Coach notes from the generation prompt |
| `created_at` | timestamp | |

---

## `workout_days`
Individual training days within a plan.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `plan_id` | integer | FK → `workout_plans.id` |
| `day_number` | integer | Ordering within the week |
| `label` | text | e.g. "Push A", "Pull B" |
| `focus` | text | e.g. "Chest / Shoulders / Triceps" |
| `rest_seconds` | integer | Default rest between sets |

---

## `workout_exercise_groups`
Named groups of exercises within a day (e.g. "Chest", "Superset A").

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `day_id` | integer | FK → `workout_days.id` |
| `group_name` | text | Display label |
| `pick_one` | boolean | If true, user selects one exercise from the group per session |
| `sort_order` | integer | |

---

## `workout_exercises`
Junction between an exercise group and the exercise library.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `group_id` | integer | FK → `workout_exercise_groups.id` |
| `exercise_id` | integer | FK → `exercises.id` |
| `sort_order` | integer | |

---

## `prescribed_sets`
Target parameters for each set of a workout exercise.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `workout_exercise_id` | integer | FK → `workout_exercises.id` |
| `set_number` | integer | 1-indexed |
| `target_reps_min` | integer | Lower bound of rep range |
| `target_reps_max` | integer | Upper bound of rep range |
| `target_weight_lbs` | numeric | `null` for bodyweight exercises |
| `rest_seconds` | integer | |

---

## `exercises`
Master exercise library (seeded; users do not add to this table directly).

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `name` | text | |
| `muscle_group` | text | e.g. `chest`, `back`, `legs` |
| `equipment` | text | e.g. `barbell`, `dumbbell`, `cable`, `bodyweight` |
| `instructions` | text | Step-by-step description |
| `video_url` | text | Optional |

---

## `workout_sessions`
A single training session (one workout day instance).

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | text | |
| `day_id` | integer | FK → `workout_days.id` |
| `started_at` | timestamp | |
| `completed_at` | timestamp | `null` while in progress |

---

## `logged_sets`
Actual performance data for each set within a session.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `session_id` | integer | FK → `workout_sessions.id` |
| `exercise_id` | integer | FK → `exercises.id` (may differ from plan if swapped) |
| `set_number` | integer | |
| `actual_reps` | integer | |
| `actual_weight_lbs` | numeric | `null` for bodyweight |
| `is_personal_record` | boolean | Computed on insert |
| `logged_at` | timestamp | |

---

## `exercise_maxes`
Personal records per exercise per user.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | text | |
| `exercise_id` | integer | FK → `exercises.id` |
| `max_weight_lbs` | numeric | |
| `achieved_at` | timestamp | |

---

## `dexa_scans`
Body composition measurements from DEXA scan uploads.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | text | |
| `scan_date` | date | |
| `body_fat_percent` | numeric | |
| `lean_mass_lbs` | numeric | |
| `visceral_fat_level` | integer | |
| `raw_text` | text | Original extracted PDF text |
| `created_at` | timestamp | |

---

## `checkins`
Periodic subjective check-ins with AI response.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | text | |
| `weight_lbs` | numeric | |
| `mood` | integer | 1–5 scale |
| `energy` | integer | 1–5 scale |
| `adherence_percent` | integer | 0–100 |
| `notes` | text | User free-text |
| `ai_response` | text | AI-generated feedback |
| `created_at` | timestamp | |

---

## `diet_profiles`
User dietary preferences.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | text | |
| `goal` | text | `bulk`, `cut`, `maintain` |
| `restrictions` | text[] | e.g. `["gluten_free", "dairy_free"]` |
| `target_calories` | integer | |

---

## `diet_recommendations`
AI-generated meal plans cached per user.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | text | |
| `content` | jsonb | Structured meal plan + macro breakdown |
| `generated_at` | timestamp | |
