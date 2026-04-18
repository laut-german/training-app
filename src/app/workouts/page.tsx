import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWorkouts } from "@/lib/repositories/workouts";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { weekLabel } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();
  const today = new Date();

  // Agrupar por semana
  const groups = new Map<string, typeof workouts>();
  for (const w of workouts) {
    const label = weekLabel(w.scheduled_date, today);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(w);
  }

  // Orden de grupos: esta semana primero, luego próxima, luego pasadas
  const ORDER = ["Esta semana", "Próxima semana", "La semana pasada"];
  const sorted = [...groups.entries()].sort(([a], [b]) => {
    const ai = ORDER.indexOf(a);
    const bi = ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <header className="pt-10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 md:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Entrenamientos</h1>
        </header>

        {/* Grupos */}
        <div className="flex flex-col gap-8 pb-12">
          {sorted.map(([label, ws]) => (
            <section key={label}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {label}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {[...ws]
                  .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
                  .map((w) => (
                    <WorkoutCard
                      key={w.id}
                      id={w.id}
                      name={w.name}
                      scheduled_date={w.scheduled_date}
                      status={w.status}
                      today={today}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
