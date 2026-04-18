import Link from "next/link";
import { ArrowLeft, Trophy, Flame, Target, TrendingUp } from "lucide-react";
import { getStatsData } from "@/lib/repositories/stats";
import { WeeklyBarsClient } from "@/components/stats/WeeklyBarsClient";
import { ActivityGridClient } from "@/components/stats/ActivityGridClient";
import { DayDistributionClient } from "@/components/stats/DayDistributionClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getStatsData();

  const heroStats = [
    {
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      value: stats.totalCompleted,
      label: "Completados",
      suffix: "",
    },
    {
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      value: stats.currentStreak,
      label: "Racha actual",
      suffix: "sem",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      value: stats.bestStreak,
      label: "Mejor racha",
      suffix: "sem",
    },
    {
      icon: <Target className="w-5 h-5 text-green-400" />,
      value: stats.completionRate,
      label: "Tasa completado",
      suffix: "%",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-semibold text-foreground">Progresión</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-8">

        {/* Hero stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {heroStats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3"
            >
              {s.icon}
              <div>
                <p className="text-xl font-black text-foreground tabular-nums leading-none">
                  {s.value}
                  {s.suffix && (
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">{s.suffix}</span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actividad semanal */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Actividad semanal — últimas 12 semanas
          </h2>
          <div className="rounded-xl bg-card border border-border px-4 py-4">
            <WeeklyBarsClient bars={stats.weeklyBars} />
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="text-[10px] text-muted-foreground">Completado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-muted border border-border" />
                <span className="text-[10px] text-muted-foreground">Programado</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mapa de actividad */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Consistencia — 12 semanas
          </h2>
          <div className="rounded-xl bg-card border border-border px-4 py-4">
            <ActivityGridClient cells={stats.activityGrid} />
          </div>
        </section>

        {/* Días de la semana */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Días que más entrenas
          </h2>
          <div className="rounded-xl bg-card border border-border px-4 py-4">
            <DayDistributionClient days={stats.dayDistribution} />
          </div>
        </section>

      </div>
    </div>
  );
}
