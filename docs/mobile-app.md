# Mobile App — LiftIQ AI

The mobile app (`artifacts/fitforge-mobile`) is an Expo React Native application using Expo Router for file-based navigation. It targets iOS and Android and shares the same API server as the web app.

## Authentication

On launch `_layout.tsx` reads an opaque auth token from AsyncStorage (`@fitforge/auth_token`). If a token is present it is supplied to `setAuthTokenGetter` so `customFetch` attaches `Authorization: Bearer <token>` to every request, then the main tab navigator is shown. If no token is found, a full-screen **Login** screen is displayed; on successful login the token is persisted to AsyncStorage for future launches. Tokens are invalidated server-side on logout.

---

## Tab screens

### Dashboard `/(tabs)/index`
The root tab shown on launch.

- Personalised greeting with the user's name
- **Training streak** counter
- **Stats strip** — total sessions, sessions this week, total sets logged
- **Active plan card** — plan name and type
- **Next workout card** — label and focus of the recommended next day; "Start" button deep-links to Session screen

---

### Workout Plan `/(tabs)/workout`
Detailed view of the active training plan.

- **Plan card** — name, type (Push/Pull/Legs, Full Body, Upper/Lower), "Active" badge, AI coach notes
- **Training day list** — each `WorkoutDayCard` shows day number, label, and focus; taps navigate to Session
- **Offline support** — plan data is cached to AsyncStorage; if the API is unreachable the cached plan is displayed and an amber **Offline Banner** appears at the top of the screen (see [Offline Support](./offline-support.md))
- Pull-to-refresh triggers a live refetch

---

### Progress `/(tabs)/progress`
Strength-gain charts for exercises tracked over time.

- **Exercise picker** — bottom-sheet dropdown listing all exercises the user has logged
- **Line chart** — SVG-based; plots max weight per session date; formatted weight labels on Y-axis
- **Delta badge** — shows weight gain or loss between first and most recent log (e.g. "+12.5 lbs")
- Empty state prompts the user to log sessions first

---

### History `/(tabs)/history`
Reverse-chronological list of completed sessions.

- Each row: date, day label, duration, set count
- **Share button** per row — opens the native OS share sheet with a formatted summary string:
  `💪 Just crushed {day} on LiftIQ AI! … Track yours → liftiq.ai`

---

### Profile `/(tabs)/profile`
User biometrics and training preferences.

- Inline-editable fields: age, weight (lbs), height (ft/in), fitness goal, experience level, days per week
- Changes saved immediately via `PATCH /api/profile`

---

## Session screen `/session/[dayId]`
The core active-workout experience.

### Session lifecycle
1. Screen loads the workout day (with offline fallback — see [Offline Support](./offline-support.md))
2. **"Start Workout"** button calls `POST /api/sessions`; triggers a success haptic
3. Set rows become editable; user enters actual reps and weight
4. **Log Set** (✓ button) calls `POST /api/sessions/:id/sets`; marks set green; light impact haptic
5. **"Finish Workout"** confirmation → calls `PATCH /api/sessions/:id` with `completedAt`

### Set logging
- Each row: set number, target range (e.g. "8–12 reps @ 135 lbs"), editable reps field, editable weight field, log button
- Logged sets turn green and become read-only
- Progress counter in the header (e.g. "6/12 sets")

### Machine Busy? / Swap Exercise
- Each exercise card has a **"Busy?"** button (amber) while a session is active
- Tapping opens **SwapExerciseModal** — a bottom sheet filtered to the same muscle group with a search bar
- Swapped exercise shown with amber name, ↔ indicator, and struck-through original name
- **"Re-swap"** button allows swapping again
- Swap is session-local only; never persisted to the server
- Sets are logged against the swapped exercise's ID

### Offline support on Session screen
- Workout day data cached to AsyncStorage per `dayId`
- If the API is unreachable, cached data loads immediately; amber **Offline Banner** appears
- Switching to a different day immediately resets cache state so stale data never bleeds across days

### Celebration on completion
- **CelebrationModal** fires after successful finish
- Full-screen modal with large emoji and random motivational message (same 20-item pool as web)
- Spring-animated entrance
- Haptic burst sequence: Success → Heavy × 3 → Medium × 2 → Light
- Dismiss navigates to History tab

---

## Components

### `CelebrationModal`
Full-screen post-workout celebration. Props: `visible`, `message`, `onDismiss`.

### `SwapExerciseModal`
Bottom-sheet exercise picker. Props: `visible`, `targetMuscleGroup`, `onSelect`, `onClose`.

### `OfflineBanner`
Amber top bar shown when cached data is in use. No props — self-contained.  
Text: "Offline — showing cached data" with a wifi-off icon.

### `WorkoutDayCard`
Navigational card for a training day. Props: `dayNumber`, `label`, `focus`, `onPress`.

### `StatCard`
Key-metric display card used in Dashboard. Props: `label`, `value`, `icon`.

### `SessionCard`
History row component. Props: session summary fields + `onShare`.

---

## Hooks

### `useOfflinePlan`
Wraps `useGetActivePlan` with AsyncStorage write-through cache.  
Returns: `{ plan, isLoading, isError, isOffline, refetch, isRefetching }`.  
Full details: [Offline Support](./offline-support.md).

### `useOfflineWorkoutDay(dayId)`
Wraps `useGetWorkoutDay` with per-day AsyncStorage cache.  
Returns: `{ day, isLoading, isError, isOffline }`.  
Full details: [Offline Support](./offline-support.md).

### `useColors`
Returns the current theme's colour tokens as a plain object. Components use this instead of hard-coded hex values to stay theme-aware.
