import { createFileRoute } from "@tanstack/react-router";

import { LatencyChart } from "@/components/dashboard/latency-chart";
import { DashboardShell } from "@/components/dashboard/shell";
import { ErrorBlock, LoadingBlock } from "@/components/dashboard/states";
import { LatencyBars, Sparkline } from "@/components/mock-charts";
import { useMonitors, useOverview } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — API Sentinel" },
      { name: "description", content: "Latency distribution, availability trends and per-region breakdowns." },
      { property: "og:title", content: "Analytics — API Sentinel" },
      { property: "og:description", content: "Latency and availability analytics across regions." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const overview = useOverview();
  const monitors = useMonitors();

  return (
    <DashboardShell title="Analytics" description="Rolling 24h window · all regions">
      <div className="space-y-6">
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-base font-semibold">Latency distribution</h2>
          <div className="mt-4">
            {overview.isLoading ? (
              <div className="glass h-56 animate-pulse rounded-xl" />
            ) : overview.isError ? (
              <ErrorBlock message={(overview.error as Error).message} onRetry={() => overview.refetch()} />
            ) : overview.data ? (
              <LatencyChart series={overview.data.latencySeries} />
            ) : null}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-2xl p-5">
            <h2 className="text-base font-semibold">Throughput by hour</h2>
            <p className="text-xs text-muted-foreground">checks executed per hour</p>
            <div className="mt-5">
              <LatencyBars bars={[42, 55, 61, 48, 70, 88, 64, 52, 76, 91, 58, 46, 67, 73, 84, 59]} />
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-5">
            <h2 className="text-base font-semibold">Per-monitor trend</h2>
            <div className="mt-4">
              {monitors.isLoading ? (
                <LoadingBlock rows={3} />
              ) : (
                <ul className="divide-y divide-border/70">
                  {monitors.data?.slice(0, 6).map((m) => (
                    <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_7rem_4.5rem] items-center gap-3 py-3">
                      <p className="min-w-0 truncate text-sm">{m.name}</p>
                      <Sparkline
                        points={m.latencySeries}
                        stroke={m.status === "up" ? "var(--emerald-core)" : "var(--warning)"}
                      />
                      <span className="text-right font-mono text-xs text-muted-foreground">
                        {m.uptime30d.toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
