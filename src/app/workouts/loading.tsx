function Sk({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />;
}

export default function WorkoutsLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <header className="pt-10 pb-6">
          <Sk className="h-3 w-10 mb-4 md:hidden" />
          <Sk className="h-7 w-48" />
        </header>

        <div className="flex flex-col gap-8 pb-12">
          {["Esta semana", "Próxima semana"].map((label) => (
            <section key={label}>
              <div className="h-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Sk className="h-2.5 w-24" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card px-4 py-3.5 flex items-center gap-4">
                    <Sk className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Sk className="h-4 w-3/4" />
                      <Sk className="h-3 w-1/3" />
                    </div>
                    <Sk className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
