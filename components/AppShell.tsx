"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Inbox, FolderKanban, Clock, RefreshCw, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Next Actions", icon: Compass },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/waiting", label: "Waiting For", icon: Clock },
  { href: "/review", label: "Review", icon: RefreshCw },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inboxCount = useAppStore((s) => s.inbox.length);

  return (
    <div className="flex h-dvh w-full">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-shrink-0 flex-col border-r border-border-soft bg-bg-2 h-full">
        <div className="flex items-center gap-2 px-5 pt-6 pb-5 border-b border-border-soft">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-amber rotate-45 flex-shrink-0" />
          <span className="font-display font-bold text-[17px]">Waypoint</span>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
                  active ? "bg-surface-2 text-text font-semibold" : "text-text-dim hover:bg-surface hover:text-text"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                <span>{item.label}</span>
                {item.href === "/inbox" && inboxCount > 0 && (
                  <span className="ml-auto text-[11px] bg-amber-dim text-amber rounded-full px-1.5 py-0.5 leading-none">
                    {inboxCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${
              pathname.startsWith("/settings") ? "bg-surface-2 text-text font-semibold" : "text-text-dim hover:bg-surface hover:text-text"
            }`}
          >
            <Settings size={17} strokeWidth={2} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 border-b border-border-soft bg-bg-2 sticky top-0 z-20"
          style={{ paddingTop: "calc(12px + env(safe-area-inset-top, 0px))", paddingBottom: "12px" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-amber rotate-45 flex-shrink-0" />
            <span className="font-display font-bold text-[15px]">Waypoint</span>
          </div>
          <Link href="/settings" className="text-text-faint p-1.5">
            <Settings size={19} />
          </Link>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav
          className="md:hidden flex items-stretch border-t border-border-soft bg-bg-2 sticky bottom-0 z-20"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] relative ${
                  active ? "text-amber" : "text-text-faint"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.3 : 2} />
                <span>{item.label === "Waiting For" ? "Waiting" : item.label}</span>
                {item.href === "/inbox" && inboxCount > 0 && (
                  <span className="absolute top-1 right-[26%] text-[9px] bg-amber text-bg rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none font-bold">
                    {inboxCount > 9 ? "9+" : inboxCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
