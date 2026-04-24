import React from "react";
import { ArrowLeft } from "lucide-react";

function Sk({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`animate-shimmer rounded-md ${className}`} style={style} />;
}

export default function StatsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 text-muted-foreground/40 md:hidden shrink-0" />
          <span className="text-sm font-semibold text-foreground">Progresión</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-8">
        {/* Hero stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3">
              <Sk className="h-5 w-5 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Sk className="h-6 w-10" />
                <Sk className="h-2 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Weekly bars section */}
        <section>
          <Sk className="h-2.5 w-52 mb-4" />
          <div className="rounded-xl bg-card border border-border px-4 py-4">
            <div className="flex items-end gap-1.5 h-28">
              {Array.from({ length: 12 }).map((_, i) => (
                <Sk
                  key={i}
                  className="flex-1"
                  style={{ height: `${30 + Math.sin(i * 0.8) * 25 + 20}%` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <Sk className="h-2.5 w-2.5 rounded-sm" />
              <Sk className="h-2 w-16" />
              <Sk className="h-2.5 w-2.5 rounded-sm" />
              <Sk className="h-2 w-18" />
            </div>
          </div>
        </section>

        {/* Activity grid section */}
        <section>
          <Sk className="h-2.5 w-40 mb-4" />
          <div className="rounded-xl bg-card border border-border px-4 py-4">
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 84 }).map((_, i) => (
                <Sk key={i} className="aspect-square rounded-sm" />
              ))}
            </div>
          </div>
        </section>

        {/* Day distribution */}
        <section>
          <Sk className="h-2.5 w-44 mb-4" />
          <div className="rounded-xl bg-card border border-border px-4 py-4">
            <div className="flex items-end gap-3 h-24">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <Sk
                    className="w-full"
                    style={{ height: `${40 + Math.abs(Math.sin(i)) * 50}%` }}
                  />
                  <Sk className="h-2 w-5" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
