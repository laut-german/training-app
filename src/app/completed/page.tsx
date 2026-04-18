import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { getWorkouts } from "@/lib/repositories/workouts";

export const dynamic = "force-dynamic";

function groupByMonth(workouts: { id: string; name: string; scheduled_date: string; original_date: string | null }[]) {
  const groups = new Map<string, typeof workouts>();
  for (const w of workouts) {
    const [year, month] = w.scheduled_date.split("-");
    const key = `${year}-${month}`;
    const arr = groups.get(key) ?? [];
    arr.push(w);
    groups.set(key, arr);
  }
  return groups;
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  const label = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
}

export default async function CompletedPage() {
  const all = await getWorkouts();
  const completed = all.filter((w) => w.status === "completed");
  const groups = groupByMonth(completed);
  const sortedKeys = [...groups.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">Completados</h1>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {completed.length} total
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-8">
        {completed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Aún no hay entrenos completados</p>
          </div>
        ) : (
          sortedKeys.map((key) => {
            const workouts = groups.get(key)!;
            return (
              <section key={key}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  {formatMonthLabel(key)}
                  <span className="ml-2 font-normal normal-case tracking-normal">
                    · {workouts.length} {workouts.length === 1 ? "entreno" : "entrenos"}
                  </span>
                </h2>

                <div className="rounded-xl bg-card border border-border overflow-hidden divide-y divide-border">
                  {workouts.map((w) => (
                    <Link
                      key={w.id}
                      href={`/workouts/${w.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                          {w.original_date && w.original_date !== w.scheduled_date && (
                            <span className="text-[9px] font-semibold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full shrink-0">
                              Movido
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDay(w.scheduled_date)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
