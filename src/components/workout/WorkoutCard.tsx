import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatShortDate, isToday } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  name: string;
  scheduled_date: string;
  status: "pending" | "completed";
  today: Date;
}

export function WorkoutCard({ id, name, scheduled_date, status, today }: Props) {
  const { day, dayNum, month } = formatShortDate(scheduled_date);
  const todayFlag = isToday(scheduled_date, today);
  const done = status === "completed";

  return (
    <Link
      href={`/workouts/${id}`}
      className={cn(
        "flex items-center gap-4 px-4 py-4 rounded-xl border transition-colors active:scale-[0.98]",
        todayFlag
          ? "bg-primary/10 border-primary/30"
          : "bg-card border-border hover:bg-muted/50",
      )}
    >
      {/* Fecha */}
      <div
        className={cn(
          "flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 text-center",
          todayFlag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <span className="text-[10px] font-medium uppercase tracking-wide leading-none">{day}</span>
        <span className="text-xl font-bold leading-tight">{dayNum}</span>
        <span className="text-[10px] leading-none">{month}</span>
      </div>

      {/* Nombre */}
      <div className="flex-1 min-w-0">
        {todayFlag && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5 block">
            Hoy
          </span>
        )}
        <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">{name}</p>
        <span
          className={cn(
            "inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
            done
              ? "bg-green-500/15 text-green-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {done ? "Completado" : "Pendiente"}
        </span>
      </div>

      <ChevronRight className="shrink-0 text-muted-foreground w-4 h-4" />
    </Link>
  );
}
