import { cn } from "@/lib/utils";

interface Props {
  targetRaw: string;
  targetType: string;
  sets?: string | null;
  className?: string;
}

export function TargetBadge({ targetRaw, targetType, sets, className }: Props) {
  if (!targetRaw) return null;

  const setsPrefix = sets ? `${sets} × ` : "";

  const label = (() => {
    switch (targetType) {
      case "time":
      case "time_range":
        return `${setsPrefix}${targetRaw}`;
      case "distance":
        return `${setsPrefix}${targetRaw}`;
      case "reps_paired":
      case "pyramid":
        return `${setsPrefix}${targetRaw}`;
      case "reps":
      case "reps_range":
        return `${setsPrefix}${targetRaw} reps`;
      default:
        return targetRaw;
    }
  })();

  const color = (() => {
    switch (targetType) {
      case "time":
      case "time_range":
        return "bg-blue-500/15 text-blue-400";
      case "distance":
        return "bg-orange-500/15 text-orange-400";
      case "pyramid":
        return "bg-purple-500/15 text-purple-400";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  })();

  return (
    <span
      className={cn(
        "inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md tabular-nums",
        color,
        className,
      )}
    >
      {label}
    </span>
  );
}
