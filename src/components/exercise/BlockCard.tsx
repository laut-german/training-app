import { ExerciseRow } from "./ExerciseRow";
import { Repeat2, Pause } from "lucide-react";
import type { WorkoutDetail } from "@/lib/repositories/workouts";
import type { ExerciseLog, SessionSummary } from "@/lib/repositories/exercise-logs";

type Section = WorkoutDetail["workout_sections"][number];
type Block = Section["blocks"][number];

interface Props {
  block: Block;
  workoutId: string;
  logs: Map<string, ExerciseLog[]>;
  historyMap: Map<string, SessionSummary[]>;
}

export function BlockCard({ block, workoutId, logs, historyMap }: Props) {
  const exercises = [...(block.exercises ?? [])].sort(
    (a, b) => a.order_index - b.order_index,
  );

  // Bloque de descanso
  if (block.type === "rest") {
    return (
      <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-muted/40 border border-border">
        <Pause className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">
          Descanso {block.rest_seconds ?? 0}&quot;
        </span>
      </div>
    );
  }

  // Bloque simple (1 ejercicio)
  if (block.type === "simple") {
    const ex = exercises[0];
    if (!ex) return null;
    return (
      <div className="px-4 rounded-xl bg-card border border-border">
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
      </div>
    );
  }

  // Superset
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      {/* Header superset */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
        <Repeat2 className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Superset · {block.rounds} rondas
        </span>
      </div>

      {/* Ejercicios */}
      <div className="divide-y divide-border px-4">
        {exercises.map((ex, i) => (
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
        ))}
      </div>
    </div>
  );
}
