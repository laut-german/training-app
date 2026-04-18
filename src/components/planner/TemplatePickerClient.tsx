"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Tag, ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { scheduleFromTemplate } from "@/lib/actions/planner";
import type { WorkoutTemplate, SectionPreview } from "@/lib/repositories/planner";
import { cn } from "@/lib/utils";

interface Props {
  date: string;
  dateLabel: string;
  templates: WorkoutTemplate[];
  previews: Record<string, SectionPreview[]>;
}

const TAG_COLORS: Record<string, string> = {
  fuerza:   "bg-blue-400/10 text-blue-400",
  potencia: "bg-orange-400/10 text-orange-400",
  circuito: "bg-purple-400/10 text-purple-400",
  plyo:     "bg-green-400/10 text-green-400",
  gi:       "bg-primary/10 text-primary",
  sport:    "bg-yellow-400/10 text-yellow-400",
  glúteos:  "bg-pink-400/10 text-pink-400",
};

export function TemplatePickerClient({ date, dateLabel, templates, previews }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<WorkoutTemplate | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const close = () => { setOpen(false); setSelected(null); };

  const handleConfirm = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await scheduleFromTemplate(selected.id, date);
      close();
      toast.success(`Entreno añadido para el ${dateLabel}`, {
        description: selected.name,
      });
      router.push(`/workouts/${result.workoutId}`);
    });
  };

  const sections = selected ? (previews[selected.id] ?? []) : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <Plus className="w-3.5 h-3.5" />
        Añadir entreno
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Sheet */}
          <div className="relative bg-background rounded-t-2xl border-t border-border max-h-[82vh] flex flex-col overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  className="p-1 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {selected ? selected.name : "Añadir entreno"}
                </p>
                <p className="text-xs text-muted-foreground">{dateLabel}</p>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1 — lista de plantillas */}
            {!selected && (
              <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="flex items-center gap-3 w-full rounded-xl bg-card border border-border px-4 py-3 text-left hover:bg-muted/50 active:scale-[0.99] transition-all"
                  >
                    <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      {t.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {t.tags.map((tag) => (
                            <span
                              key={tag}
                              className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                TAG_COLORS[tag] ?? "bg-muted text-muted-foreground",
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Step 2 — preview de ejercicios + confirmar */}
            {selected && (
              <>
                <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-4">
                  {sections.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Sin estructura previa — se creará vacío
                    </p>
                  )}
                  {sections.map((section, si) => (
                    <div key={si}>
                      {section.title && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          {section.title}
                        </p>
                      )}
                      <div className="flex flex-col gap-1.5">
                        {section.blocks.map((block, bi) => (
                          <div
                            key={bi}
                            className="rounded-xl bg-card border border-border px-3 py-2.5"
                          >
                            {block.type === "rest" ? (
                              <p className="text-xs text-muted-foreground">Descanso</p>
                            ) : (
                              <>
                                {block.rounds && block.rounds > 1 && (
                                  <p className="text-[10px] font-semibold text-primary mb-1.5">
                                    {block.rounds} rondas
                                  </p>
                                )}
                                {block.exercises.map((ex, ei) => (
                                  <div key={ei} className="flex items-baseline justify-between gap-2 py-0.5">
                                    <p className="text-sm text-foreground truncate">{ex.name}</p>
                                    <p className="text-xs text-muted-foreground shrink-0">
                                      {ex.sets ? `${ex.sets}×` : ""}{ex.target_raw}
                                    </p>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA fijo */}
                <div className="shrink-0 px-4 py-4 border-t border-border">
                  <button
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold disabled:opacity-60 transition-opacity"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isPending ? "Creando…" : `Añadir a ${dateLabel}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
