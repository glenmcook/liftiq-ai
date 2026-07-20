# Offline Support (Mobile)

The mobile app (`artifacts/fitforge-mobile`) caches critical workout data to `AsyncStorage` so users can train in the gym even when the API is unreachable.

---

## Strategy: live-first, cache-fallback

```
App opens
    │
    ├── Kick off API request (React Query)
    ├── Load AsyncStorage cache (async, parallel)
    │
    ├── Cache available?
    │   ├── Yes → display cached data immediately (no spinner)
    │   └── No  → show spinner until API responds
    │
    ├── API responds?
    │   ├── Success → replace cached display with live data; persist new data to cache
    │   └── Error   → keep showing cached data; show OfflineBanner
    │
    └── isOffline = query.isError && !!cached
```

Data is always served from `query.data ?? cached` — the cache is used as soon as it is loaded from disk, regardless of whether the network request is still in-flight or has failed.

---

## Cached data

| What | AsyncStorage key | Hook |
|---|---|---|
| Active workout plan | `liftiq:active-plan` | `useOfflinePlan` |
| Workout day detail | `liftiq:workout-day:<dayId>` | `useOfflineWorkoutDay` |

---

## `useOfflinePlan`

Location: `artifacts/fitforge-mobile/hooks/useOfflinePlan.ts`

```ts
const { plan, isLoading, isError, isOffline, refetch, isRefetching } = useOfflinePlan();
```

- Loads cache from `liftiq:active-plan` on mount
- Persists live data to cache whenever `query.data` is present
- `isOffline = query.isError && !!cached`
- `isError = !plan && query.isError` — hard error only when nothing is available

---

## `useOfflineWorkoutDay`

Location: `artifacts/fitforge-mobile/hooks/useOfflineWorkoutDay.ts`

```ts
const { day, isLoading, isError, isOffline } = useOfflineWorkoutDay(dayId);
```

- Cache key is per `dayId`: `liftiq:workout-day:<dayId>`
- When `dayId` changes, `cached` is **reset synchronously to `undefined`** before the async disk read, preventing any previous day's data from flashing on screen
- Uses a cancellable effect (`cancelled` flag) to discard stale AsyncStorage reads that resolve after the component has moved to a new `dayId`

---

## `OfflineBanner`

Location: `artifacts/fitforge-mobile/components/OfflineBanner.tsx`

A small amber strip rendered at the top of the Workout Plan screen and Session screen when `isOffline` is true.

```
┌─────────────────────────────────────────┐
│ 📶  Offline — showing cached data       │
└─────────────────────────────────────────┘
```

Styled with amber background (`#fef3c7`), amber border, dark amber text (`#92400e`).

---

## What is NOT cached (known gaps)

| Data | Status | Tracking |
|---|---|---|
| Pending set-log operations while offline | Not implemented — sets fail if API is unreachable | Task #15 |
| Cache invalidation when user switches plans | Stale plan may briefly appear | Task #16 |

---

## Adding offline support to a new screen

1. Identify the React Query hook being used (e.g. `useGetSomething`)
2. Create a new hook in `artifacts/fitforge-mobile/hooks/useOffline<Name>.ts` following the same pattern as `useOfflineWorkoutDay`
3. Choose a unique, namespaced AsyncStorage key: `liftiq:<feature>:<id-if-per-item>`
4. Replace the original hook call in the screen with the new offline-aware hook
5. Render `<OfflineBanner />` conditionally: `{isOffline && <OfflineBanner />}`
6. Update this document
