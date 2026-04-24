function Sk({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />;
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <Sk className="h-2.5 w-14" />
          <Sk className="h-4 w-44" />
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <Sk className="h-3.5 w-16 rounded-full" />
          <Sk className="h-3.5 w-20 rounded-full" />
          <Sk className="h-7 w-7 rounded-lg" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 md:gap-8 items-start">
          <div className="flex flex-col gap-5">
            {/* NextWorkoutHero skeleton */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <Sk className="h-2.5 w-20" />
                  <Sk className="h-6 w-3/4" />
                  <Sk className="h-3.5 w-1/2" />
                </div>
                <Sk className="h-10 w-10 rounded-xl shrink-0" />
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Sk className="h-8 w-24 rounded-xl" />
                <Sk className="h-8 flex-1 rounded-xl" />
              </div>
            </div>

            {/* StatsRow skeleton */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
                  <Sk className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Sk className="h-5 w-12" />
                    <Sk className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="rounded-2xl border border-border bg-card px-4 py-5">
            <Sk className="h-2.5 w-20 mb-4" />
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <Sk className="h-4 w-4 rounded-full shrink-0" />
                  <Sk className="h-3.5 flex-1" />
                  <Sk className="h-3.5 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
