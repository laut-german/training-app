"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/client";

export interface LogSetInput {
  exerciseId: string;
  catalogId: string;
  workoutId: string;
  setNumber: number;
  repsOrTime: number | null;   // reps, o segundos si es tipo time
  weightKg: number | null;
  distanceMeters: number | null;
  targetType: string;
}

export async function saveExerciseLog(input: LogSetInput) {
  const db = createSupabaseAdminClient();

  const isTime = input.targetType === "time" || input.targetType === "time_range";
  const isDistance = input.targetType === "distance";

  const { error } = await db.from("exercise_logs").upsert(
    {
      exercise_id: input.exerciseId,
      catalog_id: input.catalogId,
      workout_id: input.workoutId,
      set_number: input.setNumber,
      reps_done: !isTime && !isDistance ? input.repsOrTime : null,
      weight_kg: input.weightKg,
      duration_seconds: isTime ? input.repsOrTime : null,
      distance_meters: isDistance ? input.distanceMeters : null,
    },
    { onConflict: "exercise_id, set_number" },
  );

  if (error) throw new Error(`saveExerciseLog: ${error.message}`);
  revalidatePath(`/workouts/${input.workoutId}`);
}

export async function deleteExerciseLog(logId: string, workoutId: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("exercise_logs").delete().eq("id", logId);
  if (error) throw new Error(`deleteExerciseLog: ${error.message}`);
  revalidatePath(`/workouts/${workoutId}`);
}
