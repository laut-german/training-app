import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { getWorkoutById } from "@/lib/repositories/workouts";
import { getLogsByWorkout, getExerciseHistory, type SessionSummary } from "@/lib/repositories/exercise-logs";
import { BlockCard } from "@/components/exercise/BlockCard";
import { WorkoutDescriptionClient } from "@/components/workout/WorkoutDescriptionClient";
import { CompleteWorkoutButtonClient } from "@/components/workout/CompleteWorkoutButtonClient";
import { RescheduleDateClient } from "@/components/workout/RescheduleDateClient";
import { DeleteWorkoutButtonClient } from "@/components/workout/DeleteWorkoutButtonClient";
import { formatLongDate } from "@/lib/utils/dates";
export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  const catalogIds = [
    ...new Set(
      workout.workout_sections
        .flatMap((s) => s.blocks)
        .flatMap((b) => b.exercises)
        .map((e) => e.exercises_catalog?.id)
        .filter((cid): cid is string => Boolean(cid)),
    ),
  ];

  const [logsMap, historyMap] = await Promise.all([
    getLogsByWorkout(id),
    getExerciseHistory(catalogIds, id).catch(() => new Map<string, SessionSummary[]>()),
  ]);

  const sections = [...(workout.workout_sections ?? [])].sort(
    (a, b) => a.order_index - b.order_index,
  );
  const done = workout.status === "completed";

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto">
      {/* Header fijo */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/workouts"
          className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <RescheduleDateClient
            workoutId={workout.id}
            scheduledDate={workout.scheduled_date}
            originalDate={workout.original_date}
          />
        </div>
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </header>

      <div className="flex-1 px-4 pb-16">
        {/* Título */}
        <div className="pt-5 pb-4">
          <h1 className="text-lg font-bold text-foreground leading-snug">{workout.name}</h1>
          {workout.description && (
            <WorkoutDescriptionClient description={workout.description} />
          )}
        </div>

        {/* Secciones */}
        <div className="flex flex-col gap-6">
          {sections.map((section) => {
            const blocks = [...(section.blocks ?? [])].sort(
              (a, b) => a.order_index - b.order_index,
            );

            return (
              <section key={section.id}>
                {section.title && (
                  <div className="mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="mt-1 text-xs text-muted-foreground/70 leading-relaxed">
                        {section.description}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {blocks.map((block) => (
                    <BlockCard key={block.id} block={block} workoutId={workout.id} logs={logsMap} historyMap={historyMap} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        {/* Botón completar */}
        <div className="mt-8 flex flex-col gap-3">
          <CompleteWorkoutButtonClient workoutId={workout.id} status={workout.status as "pending" | "completed"} />
          <DeleteWorkoutButtonClient workoutId={workout.id} />
        </div>
      </div>
    </div>
  );
}
