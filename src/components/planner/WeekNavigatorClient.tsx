"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  monday: string;
  label: string;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function WeekNavigatorClient({ monday, label }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadDir, setLoadDir] = useState<"prev" | "next" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending) setLoadDir(null);
  }, [isPending]);

  function go(dir: "prev" | "next") {
    setLoadDir(dir);
    startTransition(() => {
      router.push(`/planner?week=${addDays(monday, dir === "prev" ? -7 : 7)}`);
    });
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => go("prev")}
          disabled={isPending}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            isPending
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {isPending && loadDir === "prev"
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <ChevronLeft className="w-5 h-5" />
          }
        </button>

        <span className={cn(
          "text-sm font-semibold text-foreground transition-opacity duration-150",
          isPending && "opacity-40",
        )}>
          {label}
        </span>

        <button
          onClick={() => go("next")}
          disabled={isPending}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            isPending
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {isPending && loadDir === "next"
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <ChevronRight className="w-5 h-5" />
          }
        </button>
      </div>

      {/* Thin sliding bar while fetching the new week */}
      {isPending && (
        <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden pointer-events-none">
          <div
            ref={barRef}
            className="absolute inset-y-0 w-1/3"
            style={{
              background: "var(--ring)",
              animation: "planner-bar 1.2s ease-in-out infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}
