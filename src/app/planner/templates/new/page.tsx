import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewTemplateFormClient } from "@/components/planner/NewTemplateFormClient";

export default function NewTemplatePage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/planner/templates"
          className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-semibold text-foreground">Nueva plantilla</h1>
      </header>
      <div className="px-4 py-6">
        <NewTemplateFormClient />
      </div>
    </div>
  );
}
