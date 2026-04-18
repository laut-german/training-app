import { createSupabaseClient } from "@/lib/supabase/client";

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

export interface ExerciseLog {
  id: string;
  exercise_id: string;
  set_number: number;
  reps_done: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  logged_at: string;
}

/** Todos los logs de un workout, indexados por exercise_id */
export async function getLogsByWorkout(
  workoutId: string,
): Promise<Map<string, ExerciseLog[]>> {
  // Los logs son privados — usar service role key no es necesario para lectura
  // ya que usamos la anon key y el RLS bloquea exercise_logs para anon.
  // Necesitamos leer con admin para devolver logs al server component.
  const { createSupabaseAdminClient } = await import("@/lib/supabase/client");
  const db = createSupabaseAdminClient();

  const { data, error } = await db
    .from("exercise_logs")
    .select(
      "id, exercise_id, set_number, reps_done, weight_kg, duration_seconds, distance_meters, logged_at",
    )
    .eq("workout_id", workoutId)
    .order("set_number", { ascending: true });

  if (error) throw new Error(`getLogsByWorkout: ${error.message}`);

  const map = new Map<string, ExerciseLog[]>();
  for (const log of (data ?? []) as ExerciseLog[]) {
    const arr = map.get(log.exercise_id) ?? [];
    arr.push(log);
    map.set(log.exercise_id, arr);
  }
  return map;
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
  const grouped = new Map<
    string,
    Map<string, { scheduledDate: string; sets: SessionSummary["sets"] }>
  >();

  for (const row of data ?? []) {
    const catalogId = row.catalog_id as string;
    const workoutId = row.workout_id as string;
    const workoutRow = Array.isArray(row.workouts) ? row.workouts[0] : row.workouts;
    const scheduledDate =
      (workoutRow as { scheduled_date: string } | null)?.scheduled_date ?? "";

    if (!grouped.has(catalogId)) grouped.set(catalogId, new Map());
    const byWorkout = grouped.get(catalogId)!;

    if (!byWorkout.has(workoutId))
      byWorkout.set(workoutId, { scheduledDate, sets: [] });
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
      .map(([workoutId, { scheduledDate, sets }]) => ({
        workoutId,
        scheduledDate,
        sets,
      }))
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
      .slice(0, limit);
    result.set(catalogId, sessions);
  }

  return result;
}
