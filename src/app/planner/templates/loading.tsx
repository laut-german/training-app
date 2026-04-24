import { ArrowLeft, Plus } from "lucide-react";

function Sk({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />;
}

export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <ArrowLeft className="w-5 h-5 text-muted-foreground/40 shrink-0" />
        <span className="text-sm font-semibold text-foreground flex-1">Plantillas</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-primary/40">
          <Plus className="w-3.5 h-3.5" />
          Nueva
        </span>
      </header>

      <div className="px-4 py-6 flex flex-col gap-3">
        {[3, 2, 2].map((tagCount, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-card border border-border px-4 py-3">
            <Sk className="h-4 w-4 rounded-sm shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <Sk className="h-4 w-2/3" />
              <Sk className="h-3 w-full" />
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {Array.from({ length: tagCount }).map((_, j) => (
                  <Sk key={j} className="h-4 w-12 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
