# Exercise History — Design Spec

**Date:** 2026-04-18
**Status:** Approved

## Summary

When viewing a workout and about to log sets for an exercise, the user can see a collapsible history of the last 3–5 times they did that exercise (across all previous workouts). This allows them to know their previous weight/reps and decide whether to maintain or improve.

---

## Data Layer

### New repository function

**File:** `src/lib/repositories/exercise-logs.ts`

```typescript
getExerciseHistory(
  catalogIds: string[],
  currentWorkoutId: string,
  limit: number = 5
): Promise<Map<string, SessionSummary[]>>
```

**Logic:**
1. Query `exercise_logs` joined with `workouts(scheduled_date)`.
2. Filter: `catalog_id IN catalogIds`, `workout_id != currentWorkoutId`.
3. Order: `workouts(scheduled_date) desc`, then `set_number asc`.
4. Group results in JS by `catalog_id → workout_id` to get sessions.
5. Keep only the last `limit` sessions per `catalog_id`.
6. Return `Map<catalog_id, SessionSummary[]>`.

The existing index `(catalog_id, logged_at desc)` on `exercise_logs` makes this query efficient.

### Types

```typescript
interface SessionSummary {
  workoutId: string
  scheduledDate: string   // ISO date string from workouts.scheduled_date
  sets: {
    reps_done: number | null
    weight_kg: number | null
    duration_seconds: number | null
    distance_meters: number | null
  }[]
}
```

---

## UI Layer

### New component

**File:** `src/components/exercise/ExerciseHistoryClient.tsx`

**Props:**
```typescript
interface Props {
  history: SessionSummary[]
  targetType: string
}
```

**Behavior:**
- Collapsed by default. Toggle with a chevron button labeled "Historial (N)" where N = number of sessions available.
- If `history` is empty or undefined, render nothing.
- When expanded, shows sessions newest-first.

**Summary format per `targetType`:**

| targetType | Format example |
|---|---|
| `reps` with weight | `4×8 @ 60kg` |
| `reps` no weight | `4×12` |
| `reps_range` | same as reps |
| `reps_paired` | same as reps |
| `time` / `time_range` | `4×30s` |
| `distance` | `4×200m` |
| Mixed sets (varying reps/weight) | `8@60 · 8@62 · 6@65` |

A session is "uniform" if all sets share the same reps AND same weight. Uniform sessions use the compact `N×reps @ weight` format. Non-uniform sessions fall back to listing each set separated by ` · `.

**Visual structure (expanded):**
```
▼ Historial (3)
  14 abr   4×8 @ 60kg
  07 abr   4×8 @ 57.5kg
  31 mar   3×8 @ 57.5kg
```

Date is formatted as `DD MMM` (e.g. `14 abr`) using `scheduledDate`.

---

## Data Flow

```
page.tsx (Server Component)
  ├─ getWorkoutById(id)
  ├─ getLogsByWorkout(id)          ← existing
  └─ getExerciseHistory(           ← new
       catalogIds,                 ← extracted from workout exercises
       workoutId,
       limit=5
     )
     
  → <BlockCard historyMap={historyMap} />
      → <ExerciseRow history={historyMap.get(catalogId)} />
          → <ExerciseHistoryClient history={history} targetType={targetType} />
          → <SetLoggerClient ... />    ← existing, below history
```

`catalogIds` is derived from the workout's exercises before the parallel fetch:
```typescript
const catalogIds = workout.workout_sections
  .flatMap(s => s.blocks)
  .flatMap(b => b.exercises)
  .map(e => e.exercises_catalog?.id)
  .filter(Boolean) as string[]
```

---

## Changes to Existing Components

### `src/app/workouts/[id]/page.tsx`
- Fetch `workout` first (needed to extract `catalogIds`).
- Then fetch `logsMap` and `historyMap` in parallel via `Promise.all`.
- Pass `historyMap` down to `<BlockCard>`.

```typescript
const workout = await getWorkoutById(id)
const catalogIds = extractCatalogIds(workout)
const [logsMap, historyMap] = await Promise.all([
  getLogsByWorkout(id),
  getExerciseHistory(catalogIds, id),
])
```

### `src/components/exercise/BlockCard.tsx`
- Accept new `historyMap: Map<string, SessionSummary[]>` prop.
- Pass `history={historyMap.get(exercise.exercises_catalog?.id ?? '')}` to each `<ExerciseRow>`.

### `src/components/exercise/ExerciseRow.tsx`
- Accept new `history?: SessionSummary[]` prop.
- Render `<ExerciseHistoryClient>` above `<SetLoggerClient>` when `history` is present and non-empty.

---

## Error Handling

- If `getExerciseHistory` fails, the page should not crash — catch the error and pass an empty Map so history is silently absent.
- If a `SessionSummary` has no sets, skip that session in the display.
- Exercises without a `catalog_id` (null) are excluded from the history query entirely — no history shown.

---

## Out of Scope

- PRs (personal records) — future phase.
- Charts or graphs — future phase.
- History in planner or completed views — not needed.
- Editing historical logs — not needed.
