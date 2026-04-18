/**
 * Seed script: transforma data/sessions.json → Supabase
 *
 * Idempotente: usa upsert sobre harbiz_id / slug.
 * Ejecutar con: npm run db:seed
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { parseTarget } from "../src/lib/target-parser";

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌  Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Types del JSON de Harbiz ─────────────────────────────────────────────────

interface HarbizSession {
  date: string; // "Martes 14 Abril"
  status?: string; // "completed" | "upcoming" | undefined
  workout: HarbizWorkout;
}

interface HarbizWorkout {
  _id: string;
  name: string;
  description?: string;
  exercises: HarbizExerciseItem[];
}

type HarbizExerciseItem =
  | HarbizBlockItem
  | HarbizSimpleExercise
  | HarbizSuperset
  | HarbizRestItem;

interface HarbizBlockItem {
  type: "block";
  blockId: string;
  titleBlock?: string;
  descriptionBlock?: string;
  status?: string;
}

interface HarbizSimpleExercise {
  type: "simple";
  exerciseId: string;
  name_provisional?: string;
  target?: string;
  sets?: string;
  rest?: string;
  notes?: string;
  url_provisional?: string;
  thumbnailUrl?: string;
}

interface HarbizSuperset {
  type: "superset";
  exerciseId: string;
  rounds?: number;
  supersetExercises: HarbizSupersetExercise[];
}

interface HarbizSupersetExercise {
  supersetExerciseId: string;
  supersetName_provisional?: string;
  supersetTarget?: string;
  supersetRest?: string;
  supersetNotes?: string;
  supersetUrl_provisional?: string;
  supersetImages_provisional?: boolean | string;
}

interface HarbizRestItem {
  type: "rest";
  exerciseId: string;
  rest?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_ES: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

function parseSpanishDate(raw: string): string {
  // "Martes 14 Abril" → "2026-04-14"
  const parts = raw.trim().toLowerCase().split(/\s+/);
  const day = parseInt(parts[1], 10);
  const month = MONTHS_ES[parts[2]];
  if (!month || isNaN(day)) {
    throw new Error(`No se puede parsear la fecha: "${raw}"`);
  }
  // Todas las sesiones son de 2026
  return `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[/\\()\[\]{}]/g, " ") // caracteres especiales → espacio
    .replace(/[^a-z0-9\s-]/g, "") // solo alfanumérico + espacios + guiones
    .trim()
    .replace(/\s+/g, "-") // espacios → guion
    .replace(/-+/g, "-") // guiones múltiples → uno
    .replace(/^-|-$/g, ""); // quitar guiones al inicio/fin
}

function orNull<T>(val: T | null | undefined | false): T | null {
  if (val === null || val === undefined || val === false || val === "")
    return null;
  return val;
}

// ─── Paso 1: Catálogo de ejercicios ───────────────────────────────────────────

async function seedCatalog(sessions: HarbizSession[]) {
  console.log("\n📚 Paso 1: Catálogo de ejercicios…");

  // Recolectar nombres únicos (simple + supersets)
  const uniqueNames = new Map<string, { videoUrl: string | null; thumbnailUrl: string | null }>();

  for (const session of sessions) {
    for (const item of session.workout.exercises) {
      if (item.type === "simple") {
        const name = item.name_provisional?.trim();
        if (!name) continue;
        const slug = toSlug(name);
        if (!uniqueNames.has(slug)) {
          uniqueNames.set(slug, {
            videoUrl: orNull(item.url_provisional),
            thumbnailUrl: orNull(item.thumbnailUrl),
          });
        }
      } else if (item.type === "superset") {
        for (const se of item.supersetExercises) {
          const name = se.supersetName_provisional?.trim();
          if (!name) continue;
          const slug = toSlug(name);
          if (!uniqueNames.has(slug)) {
            uniqueNames.set(slug, {
              videoUrl: orNull(se.supersetUrl_provisional),
              thumbnailUrl: null,
            });
          }
        }
      }
    }
  }

  // Detectar default_target_type por ejercicio mirando todos los targets del JSON
  const nameToTargets = new Map<string, string[]>();
  for (const session of sessions) {
    for (const item of session.workout.exercises) {
      if (item.type === "simple") {
        const name = item.name_provisional?.trim();
        if (!name) continue;
        const slug = toSlug(name);
        const existing = nameToTargets.get(slug) ?? [];
        existing.push(item.target ?? "");
        nameToTargets.set(slug, existing);
      } else if (item.type === "superset") {
        for (const se of item.supersetExercises) {
          const name = se.supersetName_provisional?.trim();
          if (!name) continue;
          const slug = toSlug(name);
          const existing = nameToTargets.get(slug) ?? [];
          existing.push(se.supersetTarget ?? "");
          nameToTargets.set(slug, existing);
        }
      }
    }
  }

  const catalogRows = Array.from(uniqueNames.entries()).map(([slug, meta]) => {
    // Usar el tipo del primer target encontrado como default_target_type
    const targets = nameToTargets.get(slug) ?? [];
    const firstNonEmpty = targets.find((t) => t.trim() !== "") ?? "";
    const { type } = parseTarget(firstNonEmpty);
    // Reconstruir nombre canónico desde slug (usamos la primera aparición en el JSON)
    const canonicalName = findFirstName(sessions, slug);
    return {
      slug,
      name: canonicalName,
      default_target_type: type,
      video_url: meta.videoUrl,
      thumbnail_url: meta.thumbnailUrl,
    };
  });

  const { error } = await db
    .from("exercises_catalog")
    .upsert(catalogRows, { onConflict: "slug" });

  if (error) throw new Error(`exercises_catalog: ${error.message}`);
  console.log(`   ✓ ${catalogRows.length} ejercicios en catálogo`);
}

function findFirstName(sessions: HarbizSession[], slug: string): string {
  for (const session of sessions) {
    for (const item of session.workout.exercises) {
      if (item.type === "simple") {
        const name = item.name_provisional?.trim();
        if (name && toSlug(name) === slug) return name;
      } else if (item.type === "superset") {
        for (const se of item.supersetExercises) {
          const name = se.supersetName_provisional?.trim();
          if (name && toSlug(name) === slug) return name;
        }
      }
    }
  }
  return slug; // fallback
}

// ─── Paso 2: Workouts + secciones + bloques + ejercicios ─────────────────────

async function seedWorkouts(sessions: HarbizSession[]) {
  console.log("\n🏋️  Paso 2: Workouts y ejercicios…");

  // Cargar catálogo para resolver catalog_id
  const { data: catalog, error: catErr } = await db
    .from("exercises_catalog")
    .select("id, slug");
  if (catErr) throw new Error(`Leer catálogo: ${catErr.message}`);

  const slugToId = new Map<string, string>(catalog!.map((e) => [e.slug, e.id]));

  for (const session of sessions) {
    const w = session.workout;
    const scheduledDate = parseSpanishDate(session.date);
    const status =
      session.status === "completed"
        ? "completed"
        : "pending";

    // ── Upsert workout ─────────────────────────────────────────────────────
    const { data: workoutRows, error: wErr } = await db
      .from("workouts")
      .upsert(
        {
          harbiz_id: w._id,
          name: w.name,
          description: orNull(w.description),
          scheduled_date: scheduledDate,
          status,
        },
        { onConflict: "harbiz_id" },
      )
      .select("id");

    if (wErr) throw new Error(`workout ${w._id}: ${wErr.message}`);
    const workoutId = workoutRows![0].id as string;

    // ── Secciones y bloques ────────────────────────────────────────────────
    let sectionId: string | null = null;
    let sectionOrder = 0;
    let blockOrder = 0;
    let defaultSectionCreated = false;

    for (const item of w.exercises) {
      if (item.type === "block") {
        // Nuevo bloque de sección
        blockOrder = 0;
        const { data: secRows, error: secErr } = await db
          .from("workout_sections")
          .upsert(
            {
              workout_id: workoutId,
              harbiz_id: item.blockId,
              title: orNull(item.titleBlock),
              description: orNull(item.descriptionBlock),
              order_index: sectionOrder,
            },
            { onConflict: "workout_id, order_index" },
          )
          .select("id");

        if (secErr) throw new Error(`section ${item.blockId}: ${secErr.message}`);
        sectionId = secRows![0].id as string;
        sectionOrder++;
      } else {
        // Si hay ejercicios antes de cualquier bloque → crear sección sin título
        if (!sectionId && !defaultSectionCreated) {
          const { data: secRows, error: secErr } = await db
            .from("workout_sections")
            .upsert(
              {
                workout_id: workoutId,
                harbiz_id: null,
                title: null,
                description: null,
                order_index: sectionOrder,
              },
              { onConflict: "workout_id, order_index" },
            )
            .select("id");

          if (secErr) throw new Error(`default section: ${secErr.message}`);
          sectionId = secRows![0].id as string;
          sectionOrder++;
          defaultSectionCreated = true;
        }

        if (!sectionId) continue;

        if (item.type === "rest") {
          // Bloque de descanso — no tiene ejercicios hijos
          const { error: blkErr } = await db.from("blocks").upsert(
            {
              section_id: sectionId,
              harbiz_id: item.exerciseId,
              type: "rest",
              rounds: 1,
              rest_seconds: item.rest ? parseInt(item.rest, 10) : null,
              order_index: blockOrder,
            },
            { onConflict: "section_id, order_index" },
          );
          if (blkErr) throw new Error(`rest block: ${blkErr.message}`);
          blockOrder++;
        } else if (item.type === "simple") {
          // Bloque individual + 1 ejercicio
          const { data: blkRows, error: blkErr } = await db
            .from("blocks")
            .upsert(
              {
                section_id: sectionId,
                harbiz_id: item.exerciseId,
                type: "simple",
                rounds: 1,
                rest_seconds: null,
                order_index: blockOrder,
              },
              { onConflict: "section_id, order_index" },
            )
            .select("id");
          if (blkErr) throw new Error(`simple block: ${blkErr.message}`);
          const blockId = blkRows![0].id as string;
          blockOrder++;

          const name = item.name_provisional?.trim() ?? "";
          const slug = name ? toSlug(name) : null;
          const { type: targetType, parsed: targetParsed } = parseTarget(item.target);

          const { error: exErr } = await db.from("exercises").upsert(
            {
              block_id: blockId,
              catalog_id: slug ? (slugToId.get(slug) ?? null) : null,
              harbiz_id: item.exerciseId,
              order_index: 0,
              sets: orNull(item.sets),
              target_raw: item.target ?? "",
              target_type: targetType,
              target_parsed: targetParsed as object,
              rest_seconds: item.rest ? parseInt(item.rest, 10) : null,
              notes: orNull(item.notes),
            },
            { onConflict: "block_id, order_index" },
          );
          if (exErr) throw new Error(`simple exercise: ${exErr.message}`);
        } else if (item.type === "superset") {
          // Bloque superset + N ejercicios
          const { data: blkRows, error: blkErr } = await db
            .from("blocks")
            .upsert(
              {
                section_id: sectionId,
                harbiz_id: item.exerciseId,
                type: "superset",
                rounds: item.rounds ?? 1,
                rest_seconds: null,
                order_index: blockOrder,
              },
              { onConflict: "section_id, order_index" },
            )
            .select("id");
          if (blkErr) throw new Error(`superset block: ${blkErr.message}`);
          const blockId = blkRows![0].id as string;
          blockOrder++;

          for (let i = 0; i < item.supersetExercises.length; i++) {
            const se = item.supersetExercises[i];
            const name = se.supersetName_provisional?.trim() ?? "";
            const slug = name ? toSlug(name) : null;
            const { type: targetType, parsed: targetParsed } = parseTarget(se.supersetTarget);

            const { error: exErr } = await db.from("exercises").upsert(
              {
                block_id: blockId,
                catalog_id: slug ? (slugToId.get(slug) ?? null) : null,
                harbiz_id: se.supersetExerciseId,
                order_index: i,
                sets: null, // sets se infiere de block.rounds
                target_raw: se.supersetTarget ?? "",
                target_type: targetType,
                target_parsed: targetParsed as object,
                rest_seconds: se.supersetRest
                  ? parseInt(se.supersetRest, 10)
                  : null,
                notes: orNull(se.supersetNotes),
              },
              { onConflict: "block_id, order_index" },
            );
            if (exErr) throw new Error(`superset exercise: ${exErr.message}`);
          }
        }
      }
    }

    console.log(`   ✓ ${session.date} — ${w.name.slice(0, 60)}…`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seed — Training App");

  const sessionsPath = join(process.cwd(), "data", "sessions.json");
  const sessions: HarbizSession[] = JSON.parse(readFileSync(sessionsPath, "utf-8"));
  console.log(`   Cargadas ${sessions.length} sesiones desde data/sessions.json`);

  await seedCatalog(sessions);
  await seedWorkouts(sessions);

  // ── Resumen final ────────────────────────────────────────────────────────
  const [{ count: wCount }, { count: ecCount }, { count: exCount }] =
    await Promise.all([
      db.from("workouts").select("*", { count: "exact", head: true }),
      db.from("exercises_catalog").select("*", { count: "exact", head: true }),
      db.from("exercises").select("*", { count: "exact", head: true }),
    ]);

  console.log("\n✅ Seed completado:");
  console.log(`   workouts:          ${wCount}`);
  console.log(`   exercises_catalog: ${ecCount}`);
  console.log(`   exercises:         ${exCount}`);
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
