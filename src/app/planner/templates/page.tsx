import Link from "next/link";
import { ArrowLeft, Plus, Tag } from "lucide-react";
import { getTemplates } from "@/lib/repositories/planner";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TAG_COLORS: Record<string, string> = {
  fuerza:   "bg-blue-400/10 text-blue-400",
  potencia: "bg-orange-400/10 text-orange-400",
  circuito: "bg-purple-400/10 text-purple-400",
  plyo:     "bg-green-400/10 text-green-400",
  gi:       "bg-primary/10 text-primary",
  sport:    "bg-yellow-400/10 text-yellow-400",
  glúteos:  "bg-pink-400/10 text-pink-400",
};

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/planner"
          className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-semibold text-foreground flex-1">Plantillas</h1>
        <Link
          href="/planner/templates/new"
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva
        </Link>
      </header>

      <div className="px-4 py-6 flex flex-col gap-3">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Tag className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No hay plantillas aún</p>
            <Link href="/planner/templates/new" className="text-sm text-primary font-medium">
              Crear primera plantilla
            </Link>
          </div>
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-xl bg-card border border-border px-4 py-3"
            >
              <Tag className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                {t.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                )}
                {t.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          TAG_COLORS[tag] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
