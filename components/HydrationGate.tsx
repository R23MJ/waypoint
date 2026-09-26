"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export default function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.resolve(useAppStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg text-text-faint text-sm">
        Loading your projects…
      </div>
    );
  }

  return <>{children}</>;
}
