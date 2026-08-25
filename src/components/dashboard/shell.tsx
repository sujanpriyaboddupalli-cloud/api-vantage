import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Gauge,
  LogOut,
  Menu,
  Radar,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuthUser } from "@/hooks/use-auth";
import { logout } from "@/lib/api/auth.service";
import { initialsOf } from "@/lib/api/session";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", to: "/dashboard", icon: Gauge },
  { label: "Monitors", to: "/dashboard/monitors", icon: Radar },
  { label: "Incidents", to: "/dashboard/incidents", icon: AlertTriangle },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { label: "Status Pages", to: "/dashboard/status-pages", icon: Activity },
  { label: "Alerts", to: "/dashboard/alerts", icon: Bell },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
] as const;

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="flex items-center gap-2 px-2 py-1" onClick={onNavigate}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-duo text-primary-foreground">
          <Radar className="h-4 w-4" />
        </span>
        <span className="font-display text-sm font-semibold tracking-tight">API Sentinel</span>
      </Link>

      <nav className="flex flex-col gap-1">
        <p className="mono-label px-2 pb-2">Workspace</p>
        {nav.map((item) => {
          const active =
            item.to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "border border-primary/30 bg-primary/10 text-foreground"
                  : "border border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="glass rounded-xl p-3">
          <p className="mono-label">Plan</p>
          <p className="mt-1 text-sm font-medium">Pro · 8 monitors</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-duo" />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/20 font-mono text-xs text-accent">
            PN
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Priya Nair</p>
            <p className="truncate text-xs text-muted-foreground">priya@acme.io</p>
          </div>
          <Link
            to="/login"
            aria-label="Sign out"
            onClick={() => logout()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid-bg noise min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb left-[-8%] top-[-10%] h-72 w-72 bg-primary" />
        <div className="orb right-[-6%] top-[30%] h-80 w-80 bg-accent" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-background/70 backdrop-blur-xl lg:block">
          <SidebarBody />
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background">
              <SidebarBody onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-background/70 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label={open ? "Close navigation" : "Open navigation"}
                  onClick={() => setOpen((v) => !v)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground lg:hidden"
                >
                  {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
                  {description && (
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
                  )}
                </div>
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
