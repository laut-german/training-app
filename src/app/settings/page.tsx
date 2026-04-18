import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemePickerClient } from "@/components/theme/ThemePickerClient";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-semibold text-foreground">Ajustes</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Apariencia */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Apariencia
          </h2>
          <ThemePickerClient />
        </section>
      </div>
    </div>
  );
}
