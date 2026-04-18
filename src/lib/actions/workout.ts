"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/client";

export async function markWorkoutCompleted(workoutId: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("workouts")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", workoutId);

  if (error) throw new Error(`markWorkoutCompleted: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
}

export async function markWorkoutPending(workoutId: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("workouts")
    .update({ status: "pending", completed_at: null })
    .eq("id", workoutId);

  if (error) throw new Error(`markWorkoutPending: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
}

export async function rescheduleWorkout(workoutId: string, newDate: string) {
  const db = createSupabaseAdminClient();

  // Leer fecha actual y original_date
  const { data: current, error: fetchError } = await db
    .from("workouts")
    .select("scheduled_date, original_date")
    .eq("id", workoutId)
    .single();

  if (fetchError || !current) throw new Error("rescheduleWorkout: workout not found");

  // original_date sólo se fija la primera vez que se mueve
  const originalDate = (current as { original_date: string | null }).original_date
    ?? (current as { scheduled_date: string }).scheduled_date;

  const { error } = await db
    .from("workouts")
    .update({ scheduled_date: newDate, original_date: originalDate })
    .eq("id", workoutId);

  if (error) throw new Error(`rescheduleWorkout: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath(`/workouts/${workoutId}`);
  revalidatePath("/stats");
  revalidatePath("/completed");
}
