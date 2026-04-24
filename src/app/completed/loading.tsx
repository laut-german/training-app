import { ArrowLeft } from "lucide-react";

function Sk({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />;
}

export default function CompletedLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 text-muted-foreground/40 md:hidden shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-foreground">Completados</span>
          </div>
          <Sk className="h-3.5 w-12 rounded-full" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-8">
        {[4, 3].map((count, gi) => (
          <section key={gi}>
            <div className="flex items-center gap-2 mb-3">
              <Sk className="h-2.5 w-28" />
              <Sk className="h-2.5 w-16" />
            </div>
            <div className="rounded-xl bg-card border border-border overflow-hidden divide-y divide-border">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Sk className="h-4 w-4 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Sk className="h-3.5 w-3/4" />
                    <Sk className="h-2.5 w-1/4" />
                  </div>
                  <Sk className="h-4 w-4 rounded-sm shrink-0" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
