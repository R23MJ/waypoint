"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { isOverdue, isDueToday, todayISO } from "@/lib/gtd";

export default function NotificationChecker() {
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const lastNotifiedDate = useAppStore((s) => s.lastNotifiedDate);
  const markNotified = useAppStore((s) => s.markNotified);
  const tasks = useAppStore((s) => s.tasks);

  useEffect(() => {
    if (!notificationsEnabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const today = todayISO();
    if (lastNotifiedDate === today) return;

    const due = tasks.filter((t) => !t.done && (isOverdue(t) || isDueToday(t)));
    if (due.length === 0) {
      markNotified(today);
      return;
    }

    new Notification("Waypoint", {
      body:
        due.length === 1
          ? `1 step is due: ${due[0].title}`
          : `${due.length} steps are due or overdue today.`,
    });
    markNotified(today);
    // Only re-run when these change; this is meant to fire at most once per
    // app-open per day, not on every task edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsEnabled, lastNotifiedDate]);

  return null;
}
