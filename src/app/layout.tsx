import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProviderClient } from "@/components/theme/ThemeProviderClient";
import { DesktopSideNav } from "@/components/layout/DesktopSideNav";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { Toaster } from "sonner";
import "./globals.css";

const POLYFILLS = `
(function(){
  if(!Promise.withResolvers){Promise.withResolvers=function(){var r,j;var p=new Promise(function(a,b){r=a;j=b;});return{promise:p,resolve:r,reject:j};};}
  if(!Array.prototype.at){Array.prototype.at=function(n){n=Math.trunc(n)||0;if(n<0)n+=this.length;if(n<0||n>=this.length)return undefined;return this[n];};}
  if(!Object.hasOwn){Object.hasOwn=function(o,k){return Object.prototype.hasOwnProperty.call(o,k);};}
  try{var t=localStorage.getItem('theme')||'dark';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}
})();
`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: POLYFILLS }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProviderClient initialTheme={theme as "light" | "dark" | "system"}>
          <NavigationProgress />
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
