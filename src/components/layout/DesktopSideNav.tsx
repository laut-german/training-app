"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, CalendarDays, BarChart2, CheckCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/workouts", label: "Entrenos", icon: Dumbbell },
  { href: "/planner", label: "Planificador", icon: CalendarDays },
  { href: "/stats", label: "Progresión", icon: BarChart2 },
  { href: "/completed", label: "Historial", icon: CheckCheck },
];

export function DesktopSideNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 border-r border-border bg-background z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Training
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            isActive("/settings")
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Ajustes
        </Link>
      </div>
    </aside>
  );
}
