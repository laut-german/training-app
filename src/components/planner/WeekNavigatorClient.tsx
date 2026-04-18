"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  monday: string; // ISO date of current Monday
  label: string;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function WeekNavigatorClient({ monday, label }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <button
        onClick={() => router.push(`/planner?week=${addDays(monday, -7)}`)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <button
        onClick={() => router.push(`/planner?week=${addDays(monday, 7)}`)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
