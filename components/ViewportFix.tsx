"use client";

import { useEffect } from "react";

/**
 * `interactiveWidget: resizes-content` (set in layout metadata) handles this
 * on modern Chrome/Android. This is the fallback for browsers that don't
 * honor it (notably iOS Safari): without it, a `fixed inset-0` sheet sizes
 * itself to the full layout viewport, which doesn't shrink when the
 * on-screen keyboard opens — so a bottom sheet's buttons end up rendered
 * underneath the keyboard instead of above it.
 */
export default function ViewportFix() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      document.documentElement.style.setProperty("--vv-height", `${vv!.height}px`);
      document.documentElement.style.setProperty("--vv-top", `${vv!.offsetTop}px`);
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return null;
}
