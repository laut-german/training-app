import Link from "next/link";
import { Check, Dot } from "lucide-react";
import { formatShortDate, isToday } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import type { WorkoutListItem } from "@/lib/repositories/workouts";

interface Props {
  workouts: WorkoutListItem[];
  today: Date;
}

export function WeekMiniList({ workouts, today }: Props) {
  const sorted = [...workouts].sort((a, b) =>
    a.scheduled_date.localeCompare(b.scheduled_date),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">Sin entrenos esta semana</p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {sorted.map((w) => {
        const { day, dayNum, month } = formatShortDate(w.scheduled_date);
        const todayFlag = isToday(w.scheduled_date, today);
        const done = w.status === "completed";

        return (
          <Link
            key={w.id}
            href={`/workouts/${w.id}`}
            className={cn(
              "flex items-center gap-3 py-3 hover:bg-muted/30 transition-colors -mx-4 px-4 rounded",
              todayFlag && "bg-primary/5",
            )}
          >
            {/* Indicador estado */}
            <div
              className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                done
                  ? "border-green-500 bg-green-500/15"
                  : todayFlag
                    ? "border-primary"
                    : "border-border",
              )}
            >
              {done ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Dot className={cn("w-4 h-4", todayFlag ? "text-primary" : "text-muted-foreground")} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{w.name}</p>
              <p className={cn("text-[10px]", todayFlag ? "text-primary font-semibold" : "text-muted-foreground")}>
                {todayFlag ? "Hoy" : `${day} ${dayNum} ${month}`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
