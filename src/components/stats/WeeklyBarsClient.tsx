"use client";

import type { WeekBar } from "@/lib/repositories/stats";
import { cn } from "@/lib/utils";

interface Props {
  bars: WeekBar[];
}

export function WeeklyBarsClient({ bars }: Props) {
  const max = Math.max(...bars.map((b) => b.total), 1);

  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {bars.map((bar) => {
        const heightPct = bar.total === 0 ? 4 : Math.max((bar.total / max) * 100, 8);
        const completedPct = bar.total === 0 ? 0 : (bar.completed / bar.total) * 100;

        return (
          <div key={bar.weekStart} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            {/* Barra */}
            <div
              className="w-full rounded-t-md overflow-hidden bg-muted relative"
              style={{ height: `${heightPct}%` }}
              title={`${bar.label}: ${bar.completed}/${bar.total}`}
            >
              {/* Parte completada */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all"
                style={{ height: `${completedPct}%` }}
              />
            </div>

            {/* Etiqueta */}
            <span className={cn(
              "text-[8px] text-muted-foreground leading-none tabular-nums",
              // Mostrar solo algunas etiquetas para no amontonar
              bars.indexOf(bar) % 3 !== 0 && "opacity-0 select-none",
            )}>
              {bar.label.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
