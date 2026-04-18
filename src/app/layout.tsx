import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProviderClient } from "@/components/theme/ThemeProviderClient";
import { DesktopSideNav } from "@/components/layout/DesktopSideNav";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Training",
  description: "App personal de entrenamientos",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "dark";
  const isDark = theme === "dark" || theme === "system";

  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased${isDark ? " dark" : ""}`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProviderClient initialTheme={theme as "light" | "dark" | "system"}>
          <div className="flex min-h-full">
            <DesktopSideNav />
            <div className="flex-1 min-w-0 md:pl-60">
              {children}
            </div>
          </div>
          <Toaster position="bottom-center" richColors />
        </ThemeProviderClient>
      </body>
    </html>
  );
}
