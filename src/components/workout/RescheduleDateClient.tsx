"use client";

import { useTransition, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { rescheduleWorkout } from "@/lib/actions/workout";

interface Props {
  workoutId: string;
  scheduledDate: string;   // ISO YYYY-MM-DD
  originalDate: string | null;
}

function parseISO(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string): string {
  const d = parseISO(dateStr);
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

export function RescheduleDateClient({ workoutId, scheduledDate, originalDate }: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentDate, setCurrentDate] = useState(scheduledDate);
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const iso = toISO(date);
    if (iso === currentDate) { setOpen(false); return; }
    setCurrentDate(iso);
    setOpen(false);
    startTransition(async () => {
      await rescheduleWorkout(workoutId, iso);
    });
  };

  const wasMoved = originalDate && originalDate !== scheduledDate;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <p className="text-xs text-muted-foreground capitalize truncate">
        {formatDisplay(currentDate)}
      </p>

      {wasMoved && (
        <span className="text-[9px] font-semibold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full shrink-0">
          Movido
        </span>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={isPending}
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          aria-label="Cambiar fecha"
          render={
            <button type="button" />
          }
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CalendarDays className="w-3.5 h-3.5" />
          )}
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 shadow-xl"
          align="start"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={parseISO(currentDate)}
            onSelect={handleSelect}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
