import { createSupabaseClient } from "@/lib/supabase/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMondayOf(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  return m;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface WeekBar {
  weekStart: string; // ISO Monday
  label: string;     // "14 Abr"
  completed: number;
  total: number;
}

export interface DayCell {
  date: string;
  status: "completed" | "scheduled" | "rescheduled" | "none";
  isToday: boolean;
}

export interface DayCount {
  dayIndex: number; // 0=Lun … 6=Dom
  dayLabel: string;
  count: number;
}

export interface StatsData {
  totalCompleted: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  weeklyBars: WeekBar[];
  activityGrid: DayCell[];
  dayDistribution: DayCount[];
}

// ─── Helpers de cálculo ───────────────────────────────────────────────────────

type RawWorkout = { scheduled_date: string; original_date: string | null; status: string };

function computeStreaks(workouts: RawWorkout[], today: string) {
  const todayDate = new Date(today + "T12:00:00");
  const thisMonday = getMondayOf(todayDate);

  const completedMondays = new Set<string>();
  for (const w of workouts) {
    if (w.status === "completed") {
      const d = new Date(w.scheduled_date + "T12:00:00");
      completedMondays.add(isoDate(getMondayOf(d)));
    }
  }

  // Racha actual — semanas consecutivas hacia atrás desde la semana pasada
  let currentStreak = 0;
  const check = new Date(thisMonday);
  check.setDate(check.getDate() - 7);
  for (let i = 0; i < 52; i++) {
    if (completedMondays.has(isoDate(check))) {
      currentStreak++;
      check.setDate(check.getDate() - 7);
    } else break;
  }

  // Mejor racha histórica
  const sorted = [...completedMondays].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const s of sorted) {
    const d = new Date(s + "T12:00:00");
    if (prev === null) {
      run = 1;
    } else {
      const diffWeeks = Math.round((d.getTime() - prev.getTime()) / (7 * 86400000));
      run = diffWeeks === 1 ? run + 1 : 1;
    }
    best = Math.max(best, run);
    prev = d;
  }

  return { currentStreak, bestStreak: Math.max(best, currentStreak) };
}

function computeWeeklyBars(workouts: RawWorkout[], today: Date): WeekBar[] {
  const bars: WeekBar[] = [];
  const monday = getMondayOf(today);

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = isoDate(weekStart);
    const endStr = isoDate(weekEnd);

    const inWeek = workouts.filter(
      (w) => w.scheduled_date >= startStr && w.scheduled_date <= endStr,
    );

    bars.push({
      weekStart: startStr,
      label: weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      completed: inWeek.filter((w) => w.status === "completed").length,
      total: inWeek.length,
    });
  }

  return bars;
}

function computeActivityGrid(workouts: RawWorkout[], today: Date): DayCell[] {
  const todayStr = isoDate(today);
  const byDate = new Map<string, "completed" | "scheduled" | "rescheduled">();

  // Primero marcar original_dates como "rescheduled" (fecha donde iba a ser)
  for (const w of workouts) {
    if (w.original_date && w.original_date !== w.scheduled_date) {
      if (!byDate.has(w.original_date)) {
        byDate.set(w.original_date, "rescheduled");
      }
    }
  }

  // Después pintar fechas reales (sobreescribe si hay workout real)
  for (const w of workouts) {
    const prev = byDate.get(w.scheduled_date);
    if (!prev || prev === "rescheduled" || w.status === "completed") {
      byDate.set(w.scheduled_date, w.status === "completed" ? "completed" : "scheduled");
    }
  }

  // Start from Monday 11 weeks ago
  const monday = getMondayOf(today);
  const start = new Date(monday);
  start.setDate(monday.getDate() - 11 * 7);

  const cells: DayCell[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < 84; i++) {
    const dateStr = isoDate(cursor);
    cells.push({
      date: dateStr,
      status: byDate.get(dateStr) ?? "none",
      isToday: dateStr === todayStr,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
}

function computeDayDistribution(workouts: RawWorkout[]): DayCount[] {
  const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  for (const w of workouts) {
    if (w.status === "completed") {
      const d = new Date(w.scheduled_date + "T12:00:00");
      const day = d.getDay(); // 0=Sun
      const idx = day === 0 ? 6 : day - 1; // convert to Mon=0
      counts[idx]++;
    }
  }

  return DAY_LABELS.map((label, i) => ({
    dayIndex: i,
    dayLabel: label,
    count: counts[i],
  }));
}

// ─── Query principal ──────────────────────────────────────────────────────────

export async function getStatsData(): Promise<StatsData> {
  const db = createSupabaseClient();
  const { data, error } = await db
    .from("workouts")
    .select("scheduled_date, original_date, status")
    .order("scheduled_date", { ascending: false });

  if (error) throw new Error(`getStatsData: ${error.message}`);
  const workouts = (data ?? []) as RawWorkout[];

  const todayDate = new Date();
  const today = isoDate(todayDate);
  const past = workouts.filter((w) => w.scheduled_date <= today);
  const totalCompleted = workouts.filter((w) => w.status === "completed").length;
  const completionRate =
    past.length > 0 ? Math.round((totalCompleted / past.length) * 100) : 0;

  const { currentStreak, bestStreak } = computeStreaks(workouts, today);

  return {
    totalCompleted,
    currentStreak,
    bestStreak,
    completionRate,
    weeklyBars: computeWeeklyBars(workouts, todayDate),
    activityGrid: computeActivityGrid(workouts, todayDate),
    dayDistribution: computeDayDistribution(workouts),
  };
}
