import { ArrowLeft } from "lucide-react";

function Sk({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />;
}

export default function WorkoutDetailLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 text-muted-foreground/40 shrink-0" />
          <div className="flex-1">
            <Sk className="h-5 w-36 rounded-full" />
          </div>
          <Sk className="h-5 w-5 rounded-full shrink-0" />
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pb-16">
        {/* Título */}
        <div className="pt-5 pb-4 flex flex-col gap-2">
          <Sk className="h-6 w-3/4" />
          <Sk className="h-3.5 w-full" />
          <Sk className="h-3.5 w-2/3" />
        </div>

        {/* Exercise blocks */}
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
              {/* Exercise header */}
              <div className="flex items-center justify-between gap-3">
                <Sk className="h-5 w-1/2" />
                <Sk className="h-6 w-12 rounded-full" />
              </div>
              {/* Video row */}
              <div className="flex items-center gap-3">
                <Sk className="h-14 w-20 rounded-xl shrink-0" />
                <Sk className="h-4 w-16" />
              </div>
              {/* Set logger */}
              <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
                <Sk className="h-3 w-3 rounded-full" />
                <Sk className="h-3.5 w-28" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <Sk className="h-11 w-full rounded-xl" />
          <Sk className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
