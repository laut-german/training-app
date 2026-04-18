import { createSupabaseClient } from "@/lib/supabase/client";

// ─── Tipos explícitos (hasta que supabase gen types genere los relacionales) ──

export interface WorkoutListItem {
  id: string;
  harbiz_id: string | null;
  name: string;
  scheduled_date: string;
  original_date: string | null;
  status: "pending" | "completed";
}

export interface CatalogInfo {
  id: string;
  slug: string;
  name: string;
  video_url: string | null;
  thumbnail_url: string | null;
}

export interface Exercise {
  id: string;
  harbiz_id: string | null;
  order_index: number;
  sets: string | null;
  target_raw: string;
  target_type: string;
  target_parsed: unknown;
  rest_seconds: number | null;
  notes: string | null;
  exercises_catalog: CatalogInfo | null;
}

export interface Block {
  id: string;
  harbiz_id: string | null;
  type: "simple" | "superset" | "rest";
  rounds: number;
  rest_seconds: number | null;
  order_index: number;
  exercises: Exercise[];
}

export interface WorkoutSection {
  id: string;
  harbiz_id: string | null;
  title: string | null;
  description: string | null;
  order_index: number;
  blocks: Block[];
}

export interface WorkoutDetail {
  id: string;
  harbiz_id: string | null;
  name: string;
  description: string | null;
  scheduled_date: string;
  original_date: string | null;
  status: "pending" | "completed";
  completed_at: string | null;
  workout_sections: WorkoutSection[];
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getWorkouts(): Promise<WorkoutListItem[]> {
  const db = createSupabaseClient();
  const { data, error } = await db
    .from("workouts")
    .select("id, harbiz_id, name, scheduled_date, original_date, status")
    .order("scheduled_date", { ascending: false });

  if (error) throw new Error(`getWorkouts: ${error.message}`);
  return (data ?? []) as WorkoutListItem[];
}

export async function getWorkoutById(id: string): Promise<WorkoutDetail | null> {
  const db = createSupabaseClient();
  const { data, error } = await db
    .from("workouts")
    .select(
      `
      id, harbiz_id, name, description, scheduled_date, original_date, status, completed_at,
      workout_sections (
        id, harbiz_id, title, description, order_index,
        blocks (
          id, harbiz_id, type, rounds, rest_seconds, order_index,
          exercises (
            id, harbiz_id, order_index, sets, target_raw, target_type, target_parsed, rest_seconds, notes,
            exercises_catalog ( id, slug, name, video_url, thumbnail_url )
          )
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`getWorkoutById: ${error.message}`);
  }
  return data as unknown as WorkoutDetail;
}

/** Cuenta ejercicios y secciones de un workout (para stat pills en home) */
export async function getWorkoutCounts(workoutId: string): Promise<{ exerciseCount: number; sectionCount: number }> {
  const db = createSupabaseClient();
  const { data } = await db
    .from("workout_sections")
    .select("id, blocks(id, exercises(id))")
    .eq("workout_id", workoutId);

  const sections = (data ?? []) as Array<{ id: string; blocks: Array<{ id: string; exercises: Array<{ id: string }> }> }>;
  const sectionCount = sections.length;
  const exerciseCount = sections.reduce(
    (acc, s) => acc + s.blocks.reduce((ba, b) => ba + (b.exercises?.length ?? 0), 0),
    0,
  );
  return { exerciseCount, sectionCount };
}

/** Próximo entreno pendiente (hoy o futuro más cercano) */
export async function getNextWorkout(): Promise<WorkoutListItem | null> {
  const db = createSupabaseClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await db
    .from("workouts")
    .select("id, harbiz_id, name, scheduled_date, status")
    .eq("status", "pending")
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getNextWorkout: ${error.message}`);
  return data as WorkoutListItem | null;
}

export interface HomeStats {
  totalCompleted: number;
  weekStreak: number;
  thisWeekWorkouts: WorkoutListItem[];
}

/** Stats para la home: completados totales, racha de semanas, entrenos de esta semana */
export async function getHomeStats(): Promise<HomeStats> {
  const db = createSupabaseClient();

  // Todos los workouts (necesitamos historial completo para la racha)
  const { data, error } = await db
    .from("workouts")
    .select("id, harbiz_id, name, scheduled_date, status")
    .order("scheduled_date", { ascending: false });

  if (error) throw new Error(`getHomeStats: ${error.message}`);
  const all = (data ?? []) as WorkoutListItem[];

  const totalCompleted = all.filter((w) => w.status === "completed").length;

  // Esta semana (lunes–domingo)
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const thisWeekWorkouts = all.filter(
    (w) => w.scheduled_date >= fmt(monday) && w.scheduled_date <= fmt(sunday),
  );

  // Racha: semanas consecutivas hacia atrás con al menos 1 completado
  let weekStreak = 0;
  let checkMonday = new Date(monday);
  checkMonday.setDate(checkMonday.getDate() - 7); // empieza en semana pasada

  for (let i = 0; i < 52; i++) {
    const wSunday = new Date(checkMonday);
    wSunday.setDate(checkMonday.getDate() + 6);
    const hasCompleted = all.some(
      (w) =>
        w.status === "completed" &&
        w.scheduled_date >= fmt(checkMonday) &&
        w.scheduled_date <= fmt(wSunday),
    );
    if (!hasCompleted) break;
    weekStreak++;
    checkMonday.setDate(checkMonday.getDate() - 7);
  }

  return { totalCompleted, weekStreak, thisWeekWorkouts };
}
