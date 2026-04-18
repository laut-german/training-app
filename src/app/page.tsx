import Link from "next/link";
import { ArrowRight, Settings, CalendarDays } from "lucide-react";
import { getNextWorkout, getHomeStats, getWorkoutCounts } from "@/lib/repositories/workouts";
import { NextWorkoutHero } from "@/components/workout/NextWorkoutHero";
import { WeekMiniList } from "@/components/workout/WeekMiniList";
import { StatsRow } from "@/components/workout/StatsRow";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();

  const [nextWorkout, stats] = await Promise.all([
    getNextWorkout(),
    getHomeStats(),
  ]);

  // Enriquecer con conteos del próximo entreno si existe
  let nextWorkoutWithMeta = nextWorkout
    ? { ...nextWorkout, exerciseCount: 0, sectionCount: 0 }
    : null;

  if (nextWorkout) {
    const counts = await getWorkoutCounts(nextWorkout.id);
    nextWorkoutWithMeta = { ...nextWorkout, ...counts };
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav top — links solo en mobile (desktop usa sidebar) */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:hidden">
            Training
          </p>
          <p className="text-sm font-semibold text-foreground">
            {today.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/workouts"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Entrenos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/planner"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Planificador
          </Link>
          <Link
            href="/settings"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Ajustes"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Layout: 1 col mobile, 2 col desktop */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 md:gap-8 items-start">

          {/* Columna principal */}
          <div className="flex flex-col gap-5">
            <NextWorkoutHero workout={nextWorkoutWithMeta} />
            <StatsRow
              totalCompleted={stats.totalCompleted}
              weekStreak={stats.weekStreak}
            />
          </div>

          {/* Sidebar — esta semana */}
          <div className="rounded-2xl border border-border bg-card px-4 py-5 md:sticky md:top-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Esta semana
            </h2>
            <WeekMiniList
              workouts={stats.thisWeekWorkouts}
              today={today}
            />

            {stats.thisWeekWorkouts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {stats.thisWeekWorkouts.filter((w) => w.status === "completed").length}
                  {" / "}
                  {stats.thisWeekWorkouts.length} completados esta semana
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.round(
                        (stats.thisWeekWorkouts.filter((w) => w.status === "completed").length /
                          stats.thisWeekWorkouts.length) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
