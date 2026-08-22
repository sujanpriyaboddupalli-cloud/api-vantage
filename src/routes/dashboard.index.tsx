import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, Clock, Radar } from "lucide-react";

import { LatencyChart } from "@/components/dashboard/latency-chart";
import { StatCard, StateBadge, StatusPulse, SeverityBadge, statusTone } from "@/components/dashboard/primitives";
import { DashboardShell } from "@/components/dashboard/shell";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/dashboard/states";
import { Button } from "@/components/ui/button";
import { useIncidents, useMonitors, useOverview } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — API Sentinel" },
      { name: "description", content: "Uptime, latency and incident overview for your monitored endpoints." },
      { property: "og:title", content: "Overview — API Sentinel" },
      { property: "og:description", content: "Live uptime and latency across every monitored endpoint." },
    ],
  }),
  component: OverviewPage,
});

function relative(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function OverviewPage() {
  const overview = useOverview();
  const monitors = useMonitors();
  const incidents = useIncidents();

  return (
    <DashboardShell
      title="Overview"
      description="Acme Platform · all regions"
      actions={
        <>
          <Button variant="glass" size="sm" className="hidden sm:inline-flex">
            Last 24h
          </Button>
          <Button variant="hero" size="sm">
            New monitor
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {overview.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass-panel h-36 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : overview.isError ? (
          <ErrorBlock message={(overview.error as Error).message} onRetry={() => overview.refetch()} />
        ) : (
          overview.data && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Uptime · 30d"
                value={overview.data.uptimePercent.toFixed(3)}
                unit="%"
                trend={overview.data.uptimeTrend}
                trendLabel="pts"
                icon={<Activity className="h-4 w-4" />}
              />
              <StatCard
                label="Avg latency"
                value={String(overview.data.avgLatencyMs)}
                unit="ms"
                trend={overview.data.latencyTrend}
                trendLabel="%"
                invertTrend
                icon={<Clock className="h-4 w-4" />}
              />
              <StatCard
                label="Active incidents"
                value={String(overview.data.activeIncidents)}
                icon={<AlertTriangle className="h-4 w-4" />}
              />
              <StatCard
                label="Monitors"
                value={String(overview.data.monitorsTotal)}
                unit={`· ${overview.data.monitorsPaused} paused`}
                icon={<Radar className="h-4 w-4" />}
              />
            </div>
          )
        )}

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="glass-panel rounded-2xl p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold">Response time</h2>
                <p className="text-xs text-muted-foreground">p50 / p95 across all monitors</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
                <StatusPulse status="up" /> live
              </span>
            </div>
            <div className="mt-4">
              {overview.isLoading ? (
                <div className="glass h-56 animate-pulse rounded-xl" />
              ) : overview.data ? (
                <LatencyChart series={overview.data.latencySeries} />
              ) : null}
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="min-w-0 truncate text-base font-semibold">Recent incidents</h2>
              <Link to="/dashboard/incidents" className="shrink-0 font-mono text-[11px] text-primary hover:underline">
                view all
              </Link>
            </div>
            <div className="mt-4">
              {incidents.isLoading ? (
                <LoadingBlock rows={3} />
              ) : incidents.isError ? (
                <ErrorBlock message={(incidents.error as Error).message} onRetry={() => incidents.refetch()} />
              ) : !incidents.data?.length ? (
                <EmptyBlock title="No incidents" description="Nothing has broken in the selected window." />
              ) : (
                <ul className="space-y-3">
                  {incidents.data.slice(0, 4).map((incident) => (
                    <li key={incident.id}>
                      <Link
                        to="/dashboard/incidents/$incidentId"
                        params={{ incidentId: incident.id }}
                        className="glass hover-glow block rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={incident.severity} />
                          <StateBadge state={incident.state} />
                          <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                            {relative(incident.startedAt)}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm font-medium">{incident.title}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {incident.monitorName}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <section className="glass-panel rounded-2xl p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Monitor status</h2>
              <p className="text-xs text-muted-foreground">Checks refresh every 30 seconds</p>
            </div>
            <Link to="/dashboard/monitors" className="shrink-0 font-mono text-[11px] text-primary hover:underline">
              manage
            </Link>
          </div>
          <div className="mt-4">
            {monitors.isLoading ? (
              <LoadingBlock rows={2} />
            ) : monitors.isError ? (
              <ErrorBlock message={(monitors.error as Error).message} onRetry={() => monitors.refetch()} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {monitors.data?.map((m) => (
                  <div key={m.id} className="glass hover-glow rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <StatusPulse status={m.status} />
                      <p className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</p>
                    </div>
                    <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{m.region}</p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <span
                        className="font-display text-xl font-semibold"
                        style={{ color: statusTone[m.status].color }}
                      >
                        {m.status === "paused" || m.status === "down" ? "—" : `${m.responseTimeMs}ms`}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {m.uptime30d.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
