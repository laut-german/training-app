# Arquitectura — Training App

> Documento de referencia para agentes y desarrolladores.
> Las **reglas operativas** están en `AGENTS.md` — este doc da el contexto y el razonamiento.

---

## Estructura de directorios

```
src/
  lib/
    supabase/            ← Infraestructura: clientes y tipos de BD
      client.ts          ← createSupabaseClient() y createSupabaseAdminClient()
      types.ts           ← Tipos generados con `npm run db:types`
    repositories/        ← Acceso a datos: 1 archivo por entidad, solo lectura
      workouts.ts
      exercises.ts
      exercise-logs.ts
    actions/             ← Mutaciones: Server Actions de Next.js
      workout.ts         ← marcarComoCompletado, guardarEsfuerzo...
      exercise-log.ts    ← guardarSerie, borrarSerie...
  components/
    ui/                  ← Primitivos de shadcn/ui (no modificar directamente)
    workout/             ← Componentes de dominio: WorkoutCard, WorkoutHeader...
    exercise/            ← ExerciseBlock, SetLogger, TargetBadge...
    layout/              ← Shell, BottomNav, PageHeader...
  app/
    page.tsx             ← Redirige a /workouts o al workout de hoy
    workouts/
      page.tsx           ← Listado semanal
      [id]/
        page.tsx         ← Vista detallada
        loading.tsx
```

---

## Las 3 reglas

### 1. Repositories = solo lectura, sin lógica

```ts
// src/lib/repositories/workouts.ts
export async function getWorkoutsByWeek(startDate: string) {
  const db = createSupabaseClient()
  const { data } = await db
    .from('workouts')
    .select('id, name, scheduled_date, status')
    .gte('scheduled_date', startDate)
    .order('scheduled_date')
  return data ?? []
}
```

- Solo llaman a Supabase. Cero lógica de negocio.
- Siempre tipados con los tipos de `supabase/types.ts`.
- Los Server Components los importan directamente — no hay capa de servicio intermedia.

### 2. Actions = toda mutación

```ts
// src/lib/actions/workout.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function markWorkoutCompleted(workoutId: string) {
  const db = createSupabaseAdminClient()
  await db.from('workouts').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', workoutId)
  revalidatePath('/workouts')
}
```

- Siempre llevan `'use server'` al inicio.
- Siempre llaman `revalidatePath` o `revalidateTag` tras escribir.
- Usan `createSupabaseAdminClient()` (service role), nunca el cliente anon.

### 3. Componentes = props, nunca importan repositories

```ts
// ✅ Correcto: recibe datos como props
export function WorkoutCard({ workout }: { workout: Workout }) { ... }

// ❌ Incorrecto: componente cliente que llama directamente a Supabase
export function WorkoutCard({ id }: { id: string }) {
  const [w, setW] = useState(null)
  useEffect(() => { supabase.from('workouts')... }, []) // NO
}
```

Los datos fluyen así:
```
Server Component (page.tsx)
  → llama repository
  → pasa datos como props
    → Client Component (interacción, timer, logs)
      → llama Server Action para mutaciones
```

---

## Convenciones de naming

| Tipo | Ejemplo | Ubicación |
|------|---------|-----------|
| Repository fn | `getWorkoutById`, `getExercisesByBlock` | `lib/repositories/` |
| Action fn | `markWorkoutCompleted`, `saveExerciseLog` | `lib/actions/` |
| Server Component | `WorkoutDetailPage` | `app/workouts/[id]/page.tsx` |
| Client Component | `SetLoggerClient` | `components/exercise/SetLoggerClient.tsx` |
| Suffix `Client` | En Client Components para distinguirlos visualmente | — |

---

## Cuándo añadir una capa nueva

**No añadir** una capa `services/` salvo que aparezca lógica de negocio compleja reutilizada entre actions (ej: calcular PR automático, agregar métricas). Si eso pasa, se documenta aquí antes de implementar.

---

_Última actualización: 2026-04-16_
