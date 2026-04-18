"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { createTemplate } from "@/lib/actions/planner";
import { cn } from "@/lib/utils";

const PRESET_TAGS = ["fuerza", "potencia", "circuito", "plyo", "gi", "sport", "glúteos", "cardio", "movilidad"];

const TAG_COLORS: Record<string, string> = {
  fuerza:    "bg-blue-400/10 text-blue-400 border-blue-400/30",
  potencia:  "bg-orange-400/10 text-orange-400 border-orange-400/30",
  circuito:  "bg-purple-400/10 text-purple-400 border-purple-400/30",
  plyo:      "bg-green-400/10 text-green-400 border-green-400/30",
  gi:        "bg-primary/10 text-primary border-primary/30",
  sport:     "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  glúteos:   "bg-pink-400/10 text-pink-400 border-pink-400/30",
  cardio:    "bg-red-400/10 text-red-400 border-red-400/30",
  movilidad: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",
};

export function NewTemplateFormClient() {
  const [name, setName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createTemplate(name.trim(), selectedTags);
      router.push("/planner/templates");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Nombre */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej. Gi Power FUERZA"
          className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Tipo de entreno
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  active
                    ? TAG_COLORS[tag] ?? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-transparent hover:border-border",
                )}
              >
                {active && <X className="w-3 h-3" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!name.trim() || isPending}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold disabled:opacity-50 transition-opacity"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Crear plantilla
      </button>
    </form>
  );
}
