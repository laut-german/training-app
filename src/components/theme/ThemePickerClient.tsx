"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProviderClient";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Claro", icon: <Sun className="w-5 h-5" /> },
  { value: "dark",  label: "Oscuro", icon: <Moon className="w-5 h-5" /> },
  { value: "system", label: "Sistema", icon: <Monitor className="w-5 h-5" /> },
];

export function ThemePickerClient() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value, label, icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border py-4 px-2 transition-all",
              active
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {icon}
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
