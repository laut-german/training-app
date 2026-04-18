"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SessionSummary } from "@/lib/repositories/exercise-logs";

interface Props {
  history: SessionSummary[];
  targetType: string;
}

function formatDate(dateStr: string): string {
  const d = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr + "T12:00:00"));
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

  // reps / reps_range / reps_paired / pyramid
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
    .map((s) =>
      s.weight_kg != null && s.weight_kg > 0
        ? `${s.reps_done ?? "?"}@${s.weight_kg}`
        : String(s.reps_done ?? "?"),
    )
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
