"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [barWidth, setBarWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstRender = useRef(true);

  function startLoading() {
    if (ticker.current) clearInterval(ticker.current);
    setOpacity(1);
    setBarWidth(12);
    ticker.current = setInterval(() => {
      setBarWidth((w) => (w >= 88 ? w : w + (88 - w) * 0.08));
    }, 150);
  }

  function completeLoading() {
    if (ticker.current) { clearInterval(ticker.current); ticker.current = null; }
    setBarWidth(100);
    setTimeout(() => setOpacity(0), 300);
    setTimeout(() => setBarWidth(0), 650);
  }

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    completeLoading();
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      try {
        const dest = new URL(link.href, location.origin);
        if (dest.origin !== location.origin) return;
        if (dest.pathname === location.pathname) return;
      } catch { return; }
      startLoading();
    }
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (ticker.current) clearInterval(ticker.current);
    };
  }, []);

  if (barWidth === 0 && opacity === 0) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[9999] pointer-events-none"
      style={{ opacity, transition: "opacity 300ms ease" }}
    >
      <div
        style={{
          height: "2px",
          width: `${barWidth}%`,
          background: "var(--ring)",
          boxShadow: "0 0 10px 2px color-mix(in oklch, var(--ring) 55%, transparent)",
          transition:
            barWidth >= 100
              ? "width 250ms cubic-bezier(0, 0, 0.2, 1)"
              : barWidth === 0
                ? "none"
                : "width 400ms ease-out",
        }}
      />
    </div>
  );
}
