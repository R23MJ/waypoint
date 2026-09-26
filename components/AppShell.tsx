"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Inbox, FolderKanban, Clock, RefreshCw, Settings, Search, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import SearchOverlay from "@/components/SearchOverlay";
import NotificationChecker from "@/components/NotificationChecker";
import QuickAddSheet from "@/components/QuickAddSheet";

const NAV = [
  { href: "/", label: "Next Actions", short: "Actions", icon: Compass },
  { href: "/inbox", label: "Inbox", short: "Inbox", icon: Inbox },
  { href: "/projects", label: "Projects", short: "Projects", icon: FolderKanban },
  { href: "/waiting", label: "Waiting For", short: "Waiting", icon: Clock },
  { href: "/review", label: "Review", short: "Review", icon: RefreshCw },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inboxCount = useAppStore((s) => s.inbox.length);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full">
      <NotificationChecker />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[248px] md:flex-shrink-0 flex-col border-r border-border-soft bg-bg-2 h-full">
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
          <span className="w-[18px] h-[18px] rounded-[5px] bg-amber rotate-45 flex-shrink-0" />
          <span className="font-display font-bold text-[17px] tracking-[-0.01em]">Waypoint</span>
        </div>

        <div className="px-3.5 mb-1">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold bg-amber text-[#241d12] hover:brightness-105 active:scale-[0.98] transition"
          >
            <Plus size={16} strokeWidth={2.5} />
            Quick capture
          </button>
        </div>
        <div className="px-3.5 mb-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-text-faint bg-surface border border-border-soft hover:text-text-dim hover:border-border transition"
          >
            <Search size={14} />
            Search
            <span className="ml-auto text-[10.5px] border border-border-soft rounded px-1.5 py-0.5">/</span>
          </button>
        </div>

        <nav className="flex-1 px-2.5 flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-colors ${
                  active ? "bg-surface text-text font-semibold" : "text-text-dim hover:bg-surface/60 hover:text-text"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-amber -ml-2.5" />}
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-amber" : ""} />
                <span>{item.label}</span>
                {item.href === "/inbox" && inboxCount > 0 && (
                  <span className="ml-auto text-[11px] bg-amber-dim text-amber rounded-full px-1.5 py-0.5 leading-none font-semibold">
                    {inboxCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2.5 pb-4 pt-2">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-colors ${
              pathname.startsWith("/settings") ? "bg-surface text-text font-semibold" : "text-text-dim hover:bg-surface/60 hover:text-text"
            }`}
          >
            <Settings size={17} strokeWidth={1.8} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-full relative">
        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center justify-between px-4 bg-bg/80 backdrop-blur-md sticky top-0 z-20 border-b border-border-soft"
          style={{ paddingTop: "calc(12px + env(safe-area-inset-top, 0px))", paddingBottom: "12px" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-[15px] h-[15px] rounded-[4px] bg-amber rotate-45 flex-shrink-0" />
            <span className="font-display font-bold text-[15.5px] tracking-[-0.01em]">Waypoint</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)} className="text-text-faint p-2 active:scale-90 transition-transform">
              <Search size={19} />
            </button>
            <Link href="/settings" className="text-text-faint p-2 active:scale-90 transition-transform">
              <Settings size={19} />
            </Link>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

        {/* Mobile floating quick-add FAB */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="md:hidden absolute right-4 z-30 w-14 h-14 rounded-full bg-amber text-[#241d12] shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          style={{ bottom: "calc(78px + env(safe-area-inset-bottom, 0px))" }}
          aria-label="Quick capture"
        >
          <Plus size={26} strokeWidth={2.4} />
        </button>

        {/* Mobile bottom tab bar — floating pill */}
        <nav
          className="md:hidden fixed left-3 right-3 z-20 bg-surface/90 backdrop-blur-md border border-border-soft rounded-2xl shadow-lg flex items-stretch"
          style={{ bottom: "calc(10px + env(safe-area-inset-bottom, 0px))" }}
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] relative"
              >
                <span
                  className={`flex items-center justify-center w-9 h-6 rounded-full transition-colors ${
                    active ? "bg-amber/15" : ""
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.3 : 1.8} className={active ? "text-amber" : "text-text-faint"} />
                </span>
                <span className={active ? "text-amber font-semibold" : "text-text-faint"}>{item.short}</span>
                {item.href === "/inbox" && inboxCount > 0 && (
                  <span className="absolute top-1 right-[22%] text-[9px] bg-amber text-[#241d12] rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none font-bold">
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
