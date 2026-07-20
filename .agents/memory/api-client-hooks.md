---
name: API client hook signatures
description: How to call orval-generated hooks in @workspace/api-client-react — positional args, not nested pathParams/body.
---

## Rule
The orval-generated hooks in `@workspace/api-client-react` use **positional arguments**, not a nested `{ pathParams, body }` object style.

## Query hooks with path params
```ts
// CORRECT
useGetWorkoutDay(dayId: number, options?)
useGetSession(sessionId: number, options?)
useGetPlan(planId: number, options?)

// WRONG — do not do this
useGetWorkoutDay({ pathParams: { dayId } })
```

## Mutation hooks
Mutations are called with `mutateAsync({ ... })` where the shape depends on whether there are path params:
```ts
// No path params — just { data }
createSession.mutateAsync({ data: { dayId } })
saveProfile.mutateAsync({ data: { age, gender, ... } })

// With path params — { sessionId, data } (path param destructured at top level)
logSet.mutateAsync({ sessionId, data: { exerciseId, setNumber, actualReps, actualWeightLbs } })
updateSession.mutateAsync({ sessionId, data: { completedAt } })
```

## Query hooks with no path params
```ts
useGetDashboardSummary(options?)  // pass {} or omit entirely
useGetActivePlan(options?)
useListSessions(options?)
useGetProfile(options?)
```

**Why:** orval generates function signatures from the OpenAPI spec directly; each path param becomes a positional argument to the underlying async function, and the mutation wrapper destructures them from the props object by name.

**How to apply:** whenever calling a hook from @workspace/api-client-react, check the generated function signature in `lib/api-client-react/src/generated/api.ts` before writing the call.
