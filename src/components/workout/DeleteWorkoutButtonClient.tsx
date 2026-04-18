"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteWorkoutFromPlanner } from "@/lib/actions/planner";

export function DeleteWorkoutButtonClient({ workoutId }: { workoutId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteWorkoutFromPlanner(workoutId);
      router.push("/planner");
    });
  };

  if (confirming) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex flex-col gap-3">
        <p className="text-sm text-foreground font-medium">¿Eliminar este entreno?</p>
        <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 rounded-lg border border-border py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 rounded-lg bg-destructive text-destructive-foreground py-2 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 transition-opacity"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Eliminar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center justify-center gap-2 w-full rounded-xl border border-border py-3 text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      Eliminar entreno
    </button>
  );
}
