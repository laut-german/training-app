export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4">
      <div className="pt-12 pb-6">
        <div className="h-3 w-20 bg-muted rounded animate-pulse mb-3" />
        <div className="h-7 w-40 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[72px] bg-card rounded-xl animate-pulse border border-border" />
        ))}
      </div>
    </div>
  );
}
