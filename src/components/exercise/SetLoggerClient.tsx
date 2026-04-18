"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X, Loader2, ChevronDown } from "lucide-react";
import { saveExerciseLog } from "@/lib/actions/exercise-log";
import { cn } from "@/lib/utils";
import type { ExerciseLog } from "@/lib/repositories/exercise-logs";

interface Props {
  exerciseId: string;
  catalogId: string | null;
  workoutId: string;
  targetType: string;
  targetRaw: string;
  existingLogs: ExerciseLog[];
}

function formatLog(log: ExerciseLog, targetType: string): string {
  if (targetType === "time" || targetType === "time_range") {
    return `${log.duration_seconds ?? 0}"`;
  }
  if (targetType === "distance") {
    return `${log.distance_meters ?? 0}m`;
  }
  const reps = log.reps_done ?? "—";
  const kg = log.weight_kg != null ? ` · ${log.weight_kg}kg` : "";
  return `${reps} reps${kg}`;
}

function SetInput({
  targetType,
  targetRaw,
  onSave,
  onCancel,
  isPending,
}: {
  targetType: string;
  targetRaw: string;
  onSave: (repsOrTime: number | null, weight: number | null, distance: number | null) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const isTime = targetType === "time" || targetType === "time_range";
  const isDistance = targetType === "distance";
  const hasWeight =
    targetType === "reps" ||
    targetType === "reps_range" ||
    targetType === "reps_paired" ||
    targetType === "pyramid";

  const [val, setVal] = useState("");
  const [weight, setWeight] = useState("");
  const [dist, setDist] = useState("");

  const handleSave = () => {
    if (isDistance) {
      onSave(null, null, dist ? parseFloat(dist) : null);
    } else if (isTime) {
      onSave(val ? parseInt(val) : null, null, null);
    } else {
      onSave(val ? parseInt(val) : null, weight ? parseFloat(weight) : null, null);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      {isTime && (
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            placeholder='seg"'
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-20 h-9 rounded-lg bg-muted border border-border text-sm text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
        </div>
      )}

      {isDistance && (
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            placeholder="metros"
            value={dist}
            onChange={(e) => setDist(e.target.value)}
            className="w-24 h-9 rounded-lg bg-muted border border-border text-sm text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
        </div>
      )}

      {!isTime && !isDistance && (
        <input
          type="number"
          inputMode="numeric"
          placeholder="reps"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-20 h-9 rounded-lg bg-muted border border-border text-sm text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          autoFocus
        />
      )}

      {hasWeight && (
        <input
          type="number"
          inputMode="decimal"
          placeholder="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-20 h-9 rounded-lg bg-muted border border-border text-sm text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50 shrink-0"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button
        onClick={onCancel}
        className="h-9 w-9 flex items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SetLoggerClient({
  exerciseId,
  catalogId,
  workoutId,
  targetType,
  targetRaw,
  existingLogs,
}: Props) {
  const [open, setOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const nextSet = existingLogs.length + 1;

  const handleSave = (
    repsOrTime: number | null,
    weight: number | null,
    distance: number | null,
  ) => {
    if (!catalogId) return;
    startTransition(async () => {
      await saveExerciseLog({
        exerciseId,
        catalogId,
        workoutId,
        setNumber: nextSet,
        repsOrTime,
        weightKg: weight,
        distanceMeters: distance,
        targetType,
      });
      setOpen(false);
    });
  };

  return (
    <div className="mt-2">
      {/* Series ya registradas */}
      {existingLogs.length > 0 && (
        <div className="mb-2">
          <button
            onClick={() => setLogsOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-green-400 font-medium"
          >
            <Check className="w-3 h-3" />
            {existingLogs.length} {existingLogs.length === 1 ? "serie" : "series"} registrada{existingLogs.length > 1 ? "s" : ""}
            <ChevronDown className={cn("w-3 h-3 transition-transform", logsOpen && "rotate-180")} />
          </button>
          {logsOpen && (
            <div className="mt-1 flex flex-col gap-0.5">
              {existingLogs.map((log) => (
                <span key={log.id} className="text-xs text-muted-foreground ml-4">
                  Serie {log.set_number}: {formatLog(log, targetType)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botón + input */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar serie {nextSet}
        </button>
      ) : (
        <SetInput
          targetType={targetType}
          targetRaw={targetRaw}
          onSave={handleSave}
          onCancel={() => setOpen(false)}
          isPending={isPending}
        />
      )}
    </div>
  );
}
