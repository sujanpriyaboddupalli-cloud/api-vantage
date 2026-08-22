import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { SeverityBadge, StateBadge } from "@/components/dashboard/primitives";
import { DashboardShell } from "@/components/dashboard/shell";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/dashboard/states";
import { Button } from "@/components/ui/button";
import { useIncidents } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/incidents/")({
  head: () => ({
    meta: [
      { title: "Incidents — API Sentinel" },
      { name: "description", content: "Open and resolved incidents with severity, duration and timelines." },
      { property: "og:title", content: "Incidents — API Sentinel" },
      { property: "og:description", content: "Track open and resolved API incidents." },
    ],
  }),
  component: IncidentsPage,
});

const filters = ["active", "resolved", "all"] as const;

function IncidentsPage() {
  const { data, isLoading, isError, error, refetch } = useIncidents();
  const [filter, setFilter] = useState<(typeof filters)[number]>("active");

  const rows = (data ?? []).filter((i) =>
    filter === "all" ? true : filter === "resolved" ? i.state === "resolved" : i.state !== "resolved",
  );

  return (
    <DashboardShell
      title="Incidents"
      description="Auto-opened by Sentinel checks, closed by your team"
      actions={
        <div className="glass flex rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                filter === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <LoadingBlock rows={4} />
      ) : isError ? (
        <ErrorBlock message={(error as Error).message} onRetry={() => refetch()} />
      ) : !rows.length ? (
        <EmptyBlock
          title="All clear"
          description="No incidents match this filter. Every monitor is reporting healthy checks."
          action={<Button variant="glass" size="sm" onClick={() => setFilter("all")}>Show all</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((incident) => (
            <li key={incident.id}>
              <Link
                to="/dashboard/incidents/$incidentId"
                params={{ incidentId: incident.id }}
                className="glass-panel hover-glow grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={incident.severity} />
                    <StateBadge state={incident.state} />
                    <span className="font-mono text-[11px] text-muted-foreground">#{incident.id}</span>
                  </div>
                  <p className="mt-2 truncate font-medium">{incident.title}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {incident.monitorName} · {incident.affectedRegions.join(", ")} ·{" "}
                    {Math.floor(incident.durationMinutes / 60)}h {incident.durationMinutes % 60}m
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
