"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { markWorkoutCompleted, markWorkoutPending } from "@/lib/actions/workout";
import { cn } from "@/lib/utils";

interface Props {
  workoutId: string;
  status: "pending" | "completed";
}

export function CompleteWorkoutButtonClient({ workoutId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const done = status === "completed";

  const handleToggle = () => {
    startTransition(async () => {
      if (done) {
        await markWorkoutPending(workoutId);
      } else {
        await markWorkoutCompleted(workoutId);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
        done
          ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/20"
          : "bg-primary text-primary-foreground hover:opacity-90",
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : done ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      {done ? "Completado — deshacer" : "Marcar como completado"}
    </button>
  );
}
