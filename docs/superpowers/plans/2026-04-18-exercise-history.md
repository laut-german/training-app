# Exercise History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a collapsible history of the last 5 sessions per exercise inside the workout detail page, so the user knows their previous reps/weight before logging new sets.

**Architecture:** New `getExerciseHistory()` repository function fetches cross-workout history keyed by `catalog_id`. Data flows server-side from `page.tsx` → `BlockCard` → `ExerciseRow` → new `ExerciseHistoryClient`. No new API routes or server actions needed.

**Tech Stack:** Next.js 15 App Router, Supabase JS v2, React, Tailwind CSS, lucide-react

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/repositories/exercise-logs.ts` | Modify | Add `SessionSummary` type + `getExerciseHistory()` |
| `src/components/exercise/ExerciseHistoryClient.tsx` | Create | Collapsible history toggle + session rows |
| `src/app/workouts/[id]/page.tsx` | Modify | Fetch history, pass `historyMap` to BlockCard |
| `src/components/exercise/BlockCard.tsx` | Modify | Accept + forward `historyMap` to ExerciseRow |
| `src/components/exercise/ExerciseRow.tsx` | Modify | Accept `history` prop, render ExerciseHistoryClient |

---

## Task 1: Add `SessionSummary` type and `getExerciseHistory()` to the repository

**Files:**
- Modify: `src/lib/repositories/exercise-logs.ts`

- [ ] **Step 1: Add the `SessionSummary` type and the function**

Open `src/lib/repositories/exercise-logs.ts` and append after the existing `getLogsByWorkout` function:

```typescript
export interface SessionSummary {
  workoutId: string;
  scheduledDate: string;
  sets: {
    reps_done: number | null;
    weight_kg: number | null;
    duration_seconds: number | null;
    distance_meters: number | null;
  }[];
}

/**
 * Últimas `limit` sesiones por catalog_id, excluyendo el workout actual.
 * Retorna Map<catalog_id, SessionSummary[]> ordenadas de más reciente a más antigua.
 */
export async function getExerciseHistory(
  catalogIds: string[],
  currentWorkoutId: string,
  limit = 5,
): Promise<Map<string, SessionSummary[]>> {
  if (catalogIds.length === 0) return new Map();

  const { createSupabaseAdminClient } = await import("@/lib/supabase/client");
  const db = createSupabaseAdminClient();

  const { data, error } = await db
    .from("exercise_logs")
    .select(
      "catalog_id, workout_id, set_number, reps_done, weight_kg, duration_seconds, distance_meters, workouts(scheduled_date)",
    )
    .in("catalog_id", catalogIds)
    .neq("workout_id", currentWorkoutId)
    .order("set_number", { ascending: true });

  if (error) throw new Error(`getExerciseHistory: ${error.message}`);

  // Group: catalog_id → workout_id → sets[]
  const grouped = new Map<string, Map<string, { scheduledDate: string; sets: SessionSummary["sets"] }>>();

  for (const row of data ?? []) {
    const catalogId = row.catalog_id as string;
    const workoutId = row.workout_id as string;
    const scheduledDate = (row.workouts as { scheduled_date: string } | null)?.scheduled_date ?? "";

    if (!grouped.has(catalogId)) grouped.set(catalogId, new Map());
    const byWorkout = grouped.get(catalogId)!;

    if (!byWorkout.has(workoutId)) byWorkout.set(workoutId, { scheduledDate, sets: [] });
    byWorkout.get(workoutId)!.sets.push({
      reps_done: row.reps_done as number | null,
      weight_kg: row.weight_kg as number | null,
      duration_seconds: row.duration_seconds as number | null,
      distance_meters: row.distance_meters as number | null,
    });
  }

  // Build result: sort sessions by date desc, keep last `limit`
  const result = new Map<string, SessionSummary[]>();
  for (const [catalogId, byWorkout] of grouped) {
    const sessions: SessionSummary[] = Array.from(byWorkout.entries())
      .map(([workoutId, { scheduledDate, sets }]) => ({ workoutId, scheduledDate, sets }))
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
      .slice(0, limit);
    result.set(catalogId, sessions);
  }

  return result;
}
```

- [ ] **Step 2: Verify TypeScript compiles without errors**

```bash
cd /Users/lautaro/personal_repositories/training_app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors referencing `exercise-logs.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/repositories/exercise-logs.ts
git commit -m "feat: add getExerciseHistory repository function"
```

---

## Task 2: Create `ExerciseHistoryClient` component

**Files:**
- Create: `src/components/exercise/ExerciseHistoryClient.tsx`

- [ ] **Step 1: Create the component file**

```typescript
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SessionSummary } from "@/lib/repositories/exercise-logs";

interface Props {
  history: SessionSummary[];
  targetType: string;
}

function formatDate(dateStr: string): string {
  // Add T12:00:00 to avoid timezone shifting the day
  const d = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
    new Date(dateStr + "T12:00:00"),
  );
  // Remove trailing period some locales add ("14 abr." → "14 abr")
  return d.replace(/\.$/, "");
}

function formatSummary(sets: SessionSummary["sets"], targetType: string): string {
  if (sets.length === 0) return "";
  const count = sets.length;

  if (targetType === "time" || targetType === "time_range") {
    const durations = sets.map((s) => s.duration_seconds);
    const allSame = durations.every((d) => d === durations[0]);
    if (allSame && durations[0] != null) return `${count}×${durations[0]}s`;
    return sets.map((s) => `${s.duration_seconds ?? "?"}s`).join(" · ");
  }

  if (targetType === "distance") {
    const distances = sets.map((s) => s.distance_meters);
    const allSame = distances.every((d) => d === distances[0]);
    if (allSame && distances[0] != null) return `${count}×${distances[0]}m`;
    return sets.map((s) => `${s.distance_meters ?? "?"}m`).join(" · ");
  }

  // reps / reps_range / reps_paired
  const repsArr = sets.map((s) => s.reps_done);
  const weightArr = sets.map((s) => s.weight_kg);
  const uniformReps = repsArr.every((r) => r === repsArr[0]);
  const uniformWeight = weightArr.every((w) => w === weightArr[0]);
  const hasWeight = weightArr.some((w) => w != null && w > 0);

  if (uniformReps && uniformWeight) {
    const r = repsArr[0] ?? "?";
    const w = weightArr[0];
    if (hasWeight && w != null) return `${count}×${r} @ ${w}kg`;
    return `${count}×${r}`;
  }

  return sets
    .map((s) => (s.weight_kg != null && s.weight_kg > 0 ? `${s.reps_done ?? "?"}@${s.weight_kg}` : String(s.reps_done ?? "?")))
    .join(" · ");
}

export function ExerciseHistoryClient({ history, targetType }: Props) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Historial ({history.length})
      </button>

      {open && (
        <div className="mt-1.5 flex flex-col gap-1">
          {history.map((session) => (
            <div
              key={session.workoutId}
              className="flex items-baseline justify-between text-xs text-muted-foreground"
            >
              <span className="w-16 shrink-0">{formatDate(session.scheduledDate)}</span>
              <span className="text-foreground/80">{formatSummary(session.sets, targetType)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles without errors**

```bash
cd /Users/lautaro/personal_repositories/training_app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors referencing `ExerciseHistoryClient.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/exercise/ExerciseHistoryClient.tsx
git commit -m "feat: add ExerciseHistoryClient component"
```

---

## Task 3: Wire up the data flow

**Files:**
- Modify: `src/app/workouts/[id]/page.tsx`
- Modify: `src/components/exercise/BlockCard.tsx`
- Modify: `src/components/exercise/ExerciseRow.tsx`

### 3a — Update `page.tsx`

- [ ] **Step 1: Replace the fetch block and pass `historyMap` to BlockCard**

In `src/app/workouts/[id]/page.tsx`, replace:

```typescript
import { getLogsByWorkout } from "@/lib/repositories/exercise-logs";
```

with:

```typescript
import { getLogsByWorkout, getExerciseHistory, type SessionSummary } from "@/lib/repositories/exercise-logs";
```

Then replace the existing parallel fetch:

```typescript
  const [workout, logsMap] = await Promise.all([
    getWorkoutById(id),
    getLogsByWorkout(id),
  ]);
```

with:

```typescript
  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  const catalogIds = [
    ...new Set(
      workout.workout_sections
        .flatMap((s) => s.blocks)
        .flatMap((b) => b.exercises)
        .map((e) => e.exercises_catalog?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [logsMap, historyMap] = await Promise.all([
    getLogsByWorkout(id),
    getExerciseHistory(catalogIds, id).catch(() => new Map<string, SessionSummary[]>()),
  ]);
```

Also remove the `if (!workout) notFound();` line that comes right after the original parallel fetch (since we moved it up).

Then in the JSX, update the `<BlockCard>` call to pass `historyMap`:

```tsx
<BlockCard key={block.id} block={block} workoutId={workout.id} logs={logsMap} historyMap={historyMap} />
```

### 3b — Update `BlockCard.tsx`

- [ ] **Step 2: Accept and forward `historyMap`**

In `src/components/exercise/BlockCard.tsx`, replace the `Props` interface and the function signature:

```typescript
import type { ExerciseLog, SessionSummary } from "@/lib/repositories/exercise-logs";

interface Props {
  block: Block;
  workoutId: string;
  logs: Map<string, ExerciseLog[]>;
  historyMap: Map<string, SessionSummary[]>;
}

export function BlockCard({ block, workoutId, logs, historyMap }: Props) {
```

Then in the simple block, add `history` prop to `<ExerciseRow>`:

```tsx
<ExerciseRow
  exerciseId={ex.id}
  workoutId={workoutId}
  name={ex.exercises_catalog?.name ?? ""}
  catalog={ex.exercises_catalog ? { ...ex.exercises_catalog } : null}
  targetRaw={ex.target_raw}
  targetType={ex.target_type}
  sets={ex.sets}
  restSeconds={ex.rest_seconds}
  notes={ex.notes}
  logs={logs.get(ex.id) ?? []}
  history={historyMap.get(ex.exercises_catalog?.id ?? "") ?? []}
/>
```

And in the superset block:

```tsx
<ExerciseRow
  key={ex.id ?? i}
  exerciseId={ex.id}
  workoutId={workoutId}
  name={ex.exercises_catalog?.name ?? ""}
  catalog={ex.exercises_catalog ? { ...ex.exercises_catalog } : null}
  targetRaw={ex.target_raw}
  targetType={ex.target_type}
  sets={ex.sets}
  restSeconds={ex.rest_seconds}
  notes={ex.notes}
  compact
  logs={logs.get(ex.id) ?? []}
  history={historyMap.get(ex.exercises_catalog?.id ?? "") ?? []}
/>
```

### 3c — Update `ExerciseRow.tsx`

- [ ] **Step 3: Accept `history` prop and render `ExerciseHistoryClient`**

In `src/components/exercise/ExerciseRow.tsx`, add the import and the prop:

```typescript
import { ExerciseHistoryClient } from "./ExerciseHistoryClient";
import type { SessionSummary } from "@/lib/repositories/exercise-logs";
```

Add to the `Props` interface:

```typescript
  history?: SessionSummary[];
```

Add to the destructured props:

```typescript
  history = [],
```

Then add `<ExerciseHistoryClient>` just above `<SetLoggerClient>`:

```tsx
      {/* Historial */}
      {history.length > 0 && (
        <ExerciseHistoryClient history={history} targetType={targetType} />
      )}

      {/* Logger de series */}
      <SetLoggerClient
        exerciseId={exerciseId}
        catalogId={catalog?.id ?? null}
        workoutId={workoutId}
        targetType={targetType}
        targetRaw={targetRaw}
        existingLogs={logs}
      />
```

- [ ] **Step 4: Verify TypeScript compiles without errors**

```bash
cd /Users/lautaro/personal_repositories/training_app && npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/workouts/[id]/page.tsx src/components/exercise/BlockCard.tsx src/components/exercise/ExerciseRow.tsx
git commit -m "feat: wire exercise history into workout detail page"
```

---

## Task 4: Visual verification with Puppeteer

- [ ] **Step 1: Ensure dev server is running on http://localhost:3000**

If not running: `npm run dev` in a separate terminal.

- [ ] **Step 2: Navigate to a workout detail page and take screenshot**

Use `mcp__puppeteer__puppeteer_navigate` to open a workout that has been done before (to have history data). Then `mcp__puppeteer__puppeteer_screenshot` to capture the result.

- [ ] **Step 3: Click "Historial" toggle and take second screenshot**

Use `mcp__puppeteer__puppeteer_click` on the "Historial" button for one exercise, then screenshot again to confirm the history rows appear correctly.

- [ ] **Step 4: Verify on a fresh workout (no history)**

Navigate to a pending workout with no prior sessions and confirm the "Historial" button does not appear for exercises with no history.
