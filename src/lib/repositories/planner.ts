import { createSupabaseClient } from "@/lib/supabase/client";
import { createSupabaseAdminClient } from "@/lib/supabase/client";

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
}

export interface PlannerWorkout {
  id: string;
  name: string;
  scheduled_date: string;
  status: "pending" | "completed";
  template_id: string | null;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getMondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export async function getWeekWorkouts(monday: Date): Promise<PlannerWorkout[]> {
  const db = createSupabaseClient();
  const start = isoDate(monday);
  const end = isoDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6));

  const { data, error } = await db
    .from("workouts")
    .select("id, name, scheduled_date, status, template_id")
    .gte("scheduled_date", start)
    .lte("scheduled_date", end)
    .order("scheduled_date");

  if (error) throw new Error(`getWeekWorkouts: ${error.message}`);
  return (data ?? []) as PlannerWorkout[];
}

export async function getTemplates(): Promise<WorkoutTemplate[]> {
  const db = createSupabaseClient();
  const { data, error } = await db
    .from("workout_templates")
    .select("id, name, description, tags")
    .order("name");

  if (error) throw new Error(`getTemplates: ${error.message}`);
  return (data ?? []) as WorkoutTemplate[];
}

export interface ExercisePreview {
  name: string;
  target_raw: string;
  sets: string | null;
}

export interface BlockPreview {
  type: string;
  rounds: number | null;
  exercises: ExercisePreview[];
}

export interface SectionPreview {
  title: string | null;
  blocks: BlockPreview[];
}

export async function getTemplatePreviews(
  templateIds: string[],
): Promise<Record<string, SectionPreview[]>> {
  if (!templateIds.length) return {};
  const db = createSupabaseAdminClient();
  const result: Record<string, SectionPreview[]> = {};

  for (const templateId of templateIds) {
    // Buscar el workout más reciente CON secciones (ignorar los creados vacíos)
    const { data: allWorkouts } = await db
      .from("workouts")
      .select("id")
      .eq("template_id", templateId)
      .order("scheduled_date", { ascending: false });

    let workoutId: string | null = null;
    for (const w of allWorkouts ?? []) {
      const { count } = await db
        .from("workout_sections")
        .select("id", { count: "exact", head: true })
        .eq("workout_id", w.id);
      if (count && count > 0) { workoutId = w.id; break; }
    }

    if (!workoutId) continue;

    const { data: sections } = await db
      .from("workout_sections")
      .select(`
        title, order_index,
        blocks (
          type, rounds, order_index,
          exercises (
            order_index, sets, target_raw,
            exercises_catalog ( name )
          )
        )
      `)
      .eq("workout_id", workoutId)
      .order("order_index");

    if (!sections) continue;

    result[templateId] = sections.map((s) => ({
      title: s.title,
      blocks: ((s.blocks ?? []) as any[])
        .sort((a, b) => a.order_index - b.order_index)
        .map((b) => ({
          type: b.type,
          rounds: b.rounds,
          exercises: ((b.exercises ?? []) as any[])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((e: any) => ({
              name: e.exercises_catalog?.name ?? "Ejercicio",
              target_raw: e.target_raw,
              sets: e.sets,
            })),
        })),
    }));
  }

  return result;
}

export async function getLatestWorkoutByTemplate(templateId: string, excludeId?: string): Promise<string | null> {
  const db = createSupabaseAdminClient();
  let query = db
    .from("workouts")
    .select("id")
    .eq("template_id", templateId)
    .order("scheduled_date", { ascending: false });

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query.limit(1).maybeSingle();
  return data?.id ?? null;
}
