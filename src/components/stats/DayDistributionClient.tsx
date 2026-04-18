"use client";

import type { DayCount } from "@/lib/repositories/stats";

interface Props {
  days: DayCount[];
}

export function DayDistributionClient({ days }: Props) {
  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-2">
      {days.map((d) => (
        <div key={d.dayIndex} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-7 shrink-0">{d.dayLabel}</span>
          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-3 text-right">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}
