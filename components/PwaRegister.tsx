"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Best-effort only — the app works fine without it, just without
      // offline caching or a clean "Add to Home Screen" prompt.
    });
  }, []);

  return null;
}
