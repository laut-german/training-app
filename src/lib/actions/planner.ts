"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/client";
import { getLatestWorkoutByTemplate } from "@/lib/repositories/planner";

// ─── Deep copy de sections / blocks / exercises ───────────────────────────────

async function deepCopyWorkout(sourceId: string, targetId: string) {
  const db = createSupabaseAdminClient();

  const { data: sections } = await db
    .from("workout_sections")
    .select("id, title, description, order_index")
    .eq("workout_id", sourceId)
    .order("order_index");

  for (const section of sections ?? []) {
    const { data: newSection } = await db
      .from("workout_sections")
      .insert({ workout_id: targetId, title: section.title, description: section.description, order_index: section.order_index })
      .select("id")
      .single();

    if (!newSection) continue;

    const { data: blocks } = await db
      .from("blocks")
      .select("id, type, rounds, rest_seconds, order_index")
      .eq("section_id", section.id)
      .order("order_index");

    for (const block of blocks ?? []) {
      const { data: newBlock } = await db
        .from("blocks")
        .insert({ section_id: newSection.id, type: block.type, rounds: block.rounds, rest_seconds: block.rest_seconds, order_index: block.order_index })
        .select("id")
        .single();

      if (!newBlock) continue;

      const { data: exercises } = await db
        .from("exercises")
        .select("catalog_id, order_index, sets, target_raw, target_type, target_parsed, rest_seconds, notes")
        .eq("block_id", block.id)
        .order("order_index");

      if (exercises?.length) {
        await db.from("exercises").insert(
          exercises.map((ex) => ({ ...ex, block_id: newBlock.id })),
        );
      }
    }
  }
}

// ─── Acciones públicas ────────────────────────────────────────────────────────

export async function scheduleFromTemplate(templateId: string, date: string) {
  const db = createSupabaseAdminClient();

  const { data: template } = await db
    .from("workout_templates")
    .select("name, description")
    .eq("id", templateId)
    .single();

  if (!template) throw new Error("Template not found");

  const { data: newWorkout, error } = await db
    .from("workouts")
    .insert({
      name: template.name,
      description: template.description,
      scheduled_date: date,
      status: "pending",
      template_id: templateId,
    })
    .select("id")
    .single();

  if (error || !newWorkout) throw new Error(`scheduleFromTemplate: ${error?.message}`);

  // Clonar estructura del workout más reciente de este template (excluir el recién creado)
  const sourceId = await getLatestWorkoutByTemplate(templateId, newWorkout.id);
  if (sourceId) {
    await deepCopyWorkout(sourceId, newWorkout.id);
  }

  revalidatePath("/planner");
  revalidatePath("/workouts");
  revalidatePath("/");
  return { workoutId: newWorkout.id };
}

export async function createTemplate(name: string, tags: string[]) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("workout_templates")
    .insert({ name, tags })
    .select("id")
    .single();

  if (error || !data) throw new Error(`createTemplate: ${error?.message}`);
  revalidatePath("/planner/templates");
  return { id: data.id };
}

export async function deleteWorkoutFromPlanner(workoutId: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("workouts").delete().eq("id", workoutId);
  if (error) throw new Error(`deleteWorkout: ${error.message}`);
  revalidatePath("/planner");
  revalidatePath("/workouts");
  revalidatePath("/");
}
