import { ArrowLeft, LayoutGrid } from "lucide-react";

function Sk({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />;
}

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function PlannerLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <ArrowLeft className="w-5 h-5 text-muted-foreground/40 md:hidden shrink-0" />
          <span className="text-sm font-semibold text-foreground flex-1">Planificador</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
            <LayoutGrid className="w-3.5 h-3.5" />
            Plantillas
          </span>
        </div>
        {/* Week navigator skeleton */}
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-2 border-t border-border/50">
          <Sk className="h-7 w-7 rounded-lg" />
          <Sk className="h-4 w-40 rounded-full" />
          <Sk className="h-7 w-7 rounded-lg" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto flex flex-col divide-y divide-border">
        {DAY_NAMES.map((name, i) => (
          <div key={name} className="px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-muted-foreground/40">
                  {i + 14}
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/50">
                {name}
              </span>
            </div>
            <div className="flex flex-col gap-2 ml-10">
              {i < 3 && (
                <div className="flex items-center gap-3 rounded-xl bg-card border border-border px-3 py-2.5">
                  <Sk className="h-4 w-4 rounded-full shrink-0" />
                  <Sk className="h-4 flex-1" />
                  <Sk className="h-4 w-14 rounded-full" />
                </div>
              )}
              <Sk className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
