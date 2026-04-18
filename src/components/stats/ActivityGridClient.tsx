"use client";

import { useState } from "react";
import type { DayCell } from "@/lib/repositories/stats";
import { cn } from "@/lib/utils";

interface Props {
  cells: DayCell[];
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export function ActivityGridClient({ cells }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  // 12 semanas × 7 días = 84 células, agrupadas por columna (semana)
  const weeks: DayCell[][] = [];
  for (let i = 0; i < 12; i++) {
    weeks.push(cells.slice(i * 7, i * 7 + 7));
  }

  return (
    <div>
      <div className="flex gap-1">
        {/* Etiquetas días */}
        <div className="flex flex-col gap-1 mr-0.5">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-[9px] text-muted-foreground h-[14px] flex items-center leading-none w-3">
              {d}
            </span>
          ))}
        </div>

        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-1">
            {week.map((cell) => (
              <div
                key={cell.date}
                onMouseEnter={() => setTooltip(cell.date)}
                onMouseLeave={() => setTooltip(null)}
                className={cn(
                  "h-[14px] rounded-sm transition-opacity cursor-default",
                  cell.isToday && "ring-1 ring-ring ring-offset-1 ring-offset-background",
                  cell.status === "completed" && "bg-primary opacity-90",
                  cell.status === "scheduled" && "bg-primary opacity-25",
                  cell.status === "rescheduled" && "bg-orange-400 opacity-50",
                  cell.status === "none" && "bg-muted",
                )}
                title={
                  cell.status === "completed"
                    ? `${cell.date} — completado`
                    : cell.status === "scheduled"
                    ? `${cell.date} — programado`
                    : cell.date
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="h-[10px] w-[10px] rounded-sm bg-primary opacity-90" />
          <span className="text-[10px] text-muted-foreground">Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-[10px] w-[10px] rounded-sm bg-primary opacity-25" />
          <span className="text-[10px] text-muted-foreground">Programado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-[10px] w-[10px] rounded-sm bg-orange-400 opacity-50" />
          <span className="text-[10px] text-muted-foreground">Movido</span>
        </div>
      </div>
    </div>
  );
}
