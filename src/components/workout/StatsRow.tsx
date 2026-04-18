import Link from "next/link";
import { Flame, Trophy, ChevronRight } from "lucide-react";

interface Props {
  totalCompleted: number;
  weekStreak: number;
}

export function StatsRow({ totalCompleted, weekStreak }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/completed"
        className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 hover:bg-muted/50 transition-colors active:scale-[0.98]"
      >
        <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xl font-black text-foreground tabular-nums">{totalCompleted}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Completados
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </Link>

      <Link
        href="/stats"
        className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 hover:bg-muted/50 transition-colors active:scale-[0.98]"
      >
        <Flame className={weekStreak > 0 ? "w-5 h-5 text-orange-400 shrink-0" : "w-5 h-5 text-muted-foreground shrink-0"} />
        <div className="flex-1 min-w-0">
          <p className="text-xl font-black text-foreground tabular-nums">
            {weekStreak}
            <span className="text-xs font-normal text-muted-foreground ml-1">sem</span>
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Racha
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </Link>
    </div>
  );
}
