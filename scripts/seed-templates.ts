/**
 * Extrae plantillas de los workouts existentes y las vincula.
 * Ejecutar UNA vez después de crear la tabla workout_templates.
 *
 * npx tsx scripts/seed-templates.ts
 */
import { createSupabaseAdminClient } from "../src/lib/supabase/client";

const TEMPLATES = [
  {
    name: "Gi Power FUERZA",
    tags: ["fuerza", "gi"],
    pattern: /Gi Power FUERZA/i,
  },
  {
    name: "Gi Power POTENCIA Circuito",
    tags: ["potencia", "circuito", "gi"],
    pattern: /Gi [Pp]ower POTENCIA Circuito/i,
  },
  {
    name: "Gi Power POTENCIA",
    tags: ["potencia", "gi"],
    pattern: /Gi [Pp]ower POTENCIA/i,
  },
  {
    name: "Gi Power PLYO + FUERZA",
    tags: ["plyo", "fuerza", "gi"],
    pattern: /Gi Power PLYO/i,
  },
  {
    name: "Gi Power CIRCUIT",
    tags: ["circuito", "gi"],
    pattern: /Gi Power CIRCUIT/i,
  },
  {
    name: "Gi-Sport POTENCIA",
    tags: ["potencia", "sport"],
    pattern: /Gi-Sport POTENCIA/i,
  },
  {
    name: "Rutina de Glúteos",
    tags: ["fuerza", "glúteos"],
    pattern: /Rutina de Gl[uú]teos/i,
  },
];

async function main() {
  const db = createSupabaseAdminClient();

  // 1. Insertar plantillas
  const templateMap = new Map<string, string>(); // name → id

  for (const t of TEMPLATES) {
    // Check if already exists
    const { data: existing } = await db
      .from("workout_templates")
      .select("id, name")
      .eq("name", t.name)
      .maybeSingle();

    if (existing) {
      templateMap.set(t.name, existing.id);
      console.log(`~ Template ya existe: ${existing.name}`);
      continue;
    }

    const { data, error } = await db
      .from("workout_templates")
      .insert({ name: t.name, tags: t.tags })
      .select("id, name")
      .single();

    if (error) { console.error(`Error creando "${t.name}":`, error.message); continue; }
    templateMap.set(t.name, data.id);
    console.log(`✓ Template: ${data.name} (${data.id})`);
  }

  // 2. Vincular workouts existentes a sus templates
  const { data: workouts } = await db
    .from("workouts")
    .select("id, name")
    .is("template_id", null);

  let linked = 0;
  for (const w of workouts ?? []) {
    for (const t of TEMPLATES) {
      if (t.pattern.test(w.name)) {
        const templateId = templateMap.get(t.name);
        if (!templateId) continue;
        await db.from("workouts").update({ template_id: templateId }).eq("id", w.id);
        console.log(`  → "${w.name.slice(0, 50)}" → ${t.name}`);
        linked++;
        break;
      }
    }
  }

  console.log(`\n✅ ${templateMap.size} plantillas creadas, ${linked} workouts vinculados`);
}

main().catch(console.error);
