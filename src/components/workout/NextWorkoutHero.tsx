import Link from "next/link";
import { ArrowRight, CalendarX } from "lucide-react";
import { formatShortDate } from "@/lib/utils/dates";
import type { WorkoutListItem } from "@/lib/repositories/workouts";

interface Props {
  workout: WorkoutListItem & { exerciseCount: number; sectionCount: number } | null;
}

export function NextWorkoutHero({ workout }: Props) {
  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <CalendarX className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Sin entrenos programados</p>
      </div>
    );
  }

  const { day, dayNum, month } = formatShortDate(workout.scheduled_date);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative p-6 flex flex-col gap-4">
        {/* Label */}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Próximo entreno
        </span>

        {/* Fecha */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground tabular-nums">{dayNum}</span>
          <span className="text-base font-semibold text-muted-foreground">
            {day} · {month}
          </span>
        </div>

        {/* Nombre */}
        <h2 className="text-xl font-bold text-foreground leading-snug line-clamp-2 -mt-1">
          {workout.name}
        </h2>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
            {workout.exerciseCount} ejercicios
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
            {workout.sectionCount} bloques
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/workouts/${workout.id}`}
          className="inline-flex items-center justify-center gap-2 mt-1 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm py-3 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Empezar entreno
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
