"use client";

import { useEffect } from "react";
import { useThemeStore, resolveTheme } from "@/lib/theme-store";

export default function ThemeProvider() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    function apply() {
      const resolved = resolveTheme(mode);
      const root = document.documentElement;
      if (resolved === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
    }
    apply();

    if (mode === "system" && typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [mode]);

  return null;
}
