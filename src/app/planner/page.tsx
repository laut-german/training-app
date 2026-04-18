import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, LayoutGrid } from "lucide-react";
import { getWeekWorkouts, getTemplates, getTemplatePreviews, getMondayOf, getWeekDays } from "@/lib/repositories/planner";
import { WeekNavigatorClient } from "@/components/planner/WeekNavigatorClient";
import { TemplatePickerClient } from "@/components/planner/TemplatePickerClient";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatWeekLabel(monday: Date, sunday: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `${fmt(monday)} — ${fmt(sunday)}`;
}

export default async function PlannerPage(props: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await props.searchParams;

  const today = new Date();
  const todayISO = toISO(today);

  const monday = week ? parseISO(week) : getMondayOf(today);
  const days = getWeekDays(monday);
  const sunday = days[6];
  const mondayISO = toISO(monday);

  const [workouts, templates] = await Promise.all([
    getWeekWorkouts(monday),
    getTemplates(),
  ]);

  const previews = await getTemplatePreviews(templates.map((t) => t.id));

  // Índice por fecha
  const byDate = new Map<string, typeof workouts>();
  for (const w of workouts) {
    const arr = byDate.get(w.scheduled_date) ?? [];
    arr.push(w);
    byDate.set(w.scheduled_date, arr);
  }

  const weekLabel = formatWeekLabel(monday, sunday);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-semibold text-foreground flex-1">Planificador</h1>
          <Link
            href="/planner/templates"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Plantillas
          </Link>
        </div>
        <WeekNavigatorClient monday={mondayISO} label={weekLabel} />
      </header>

      {/* Días */}
      <div className="max-w-2xl mx-auto flex flex-col divide-y divide-border">
        {days.map((day, i) => {
          const iso = toISO(day);
          const isToday = iso === todayISO;
          const dayWorkouts = byDate.get(iso) ?? [];
          const dayName = DAY_NAMES[i];
          const dayNum = day.getDate();
          const monthShort = day.toLocaleDateString("es-ES", { month: "short" });

          return (
            <div
              key={iso}
              className={cn(
                "px-4 py-4",
                isToday && "bg-primary/5",
              )}
            >
              {/* Fila superior: nombre día + etiqueta HOY */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}>
                  {dayNum}
                </div>
                <div>
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}>
                    {dayName}
                  </span>
                  {!isToday && (
                    <span className="text-xs text-muted-foreground ml-1">{monthShort}</span>
                  )}
                  {isToday && (
                    <span className="text-xs font-bold text-primary ml-1">· Hoy</span>
                  )}
                </div>
              </div>

              {/* Workouts del día */}
              <div className="flex flex-col gap-2 ml-10">
                {dayWorkouts.map((w) => (
                  <Link
                    key={w.id}
                    href={`/workouts/${w.id}`}
                    className="flex items-center gap-3 rounded-xl bg-card border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    {w.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {w.name}
                    </span>
                    <span className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0",
                      w.status === "completed"
                        ? "bg-green-400/10 text-green-400"
                        : "bg-muted text-muted-foreground",
                    )}>
                      {w.status === "completed" ? "Listo" : "Pendiente"}
                    </span>
                  </Link>
                ))}

                {/* Botón añadir */}
                <TemplatePickerClient
                  date={iso}
                  dateLabel={`${dayName} ${dayNum} ${monthShort}`}
                  templates={templates}
                  previews={previews}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
