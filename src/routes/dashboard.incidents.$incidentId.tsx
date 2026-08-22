import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, CircleDot } from "lucide-react";

import { SeverityBadge, StateBadge, StatusPulse } from "@/components/dashboard/primitives";
import { DashboardShell } from "@/components/dashboard/shell";
import { ErrorBlock, LoadingBlock } from "@/components/dashboard/states";
import { Button } from "@/components/ui/button";
import { useIncident } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/incidents/$incidentId")({
  head: () => ({
    meta: [
      { title: "Incident detail — API Sentinel" },
      { name: "description", content: "Timeline-style incident log with severity, root cause and updates." },
      { property: "og:title", content: "Incident detail — API Sentinel" },
      { property: "og:description", content: "Full incident timeline and root cause." },
    ],
  }),
  component: IncidentDetailPage,
});

function timeOf(iso: string) {
  return new Date(iso).toISOString().slice(11, 16) + " UTC";
}

function IncidentDetailPage() {
  const { incidentId } = Route.useParams();
  const { data, isLoading, isError, error, refetch } = useIncident(incidentId);

  return (
    <DashboardShell
      title={data?.title ?? "Incident"}
      description={data ? `#${data.id} · ${data.monitorName}` : "Loading incident…"}
      actions={
        <Button variant="glass" size="sm" asChild>
          <Link to="/dashboard/incidents">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <LoadingBlock rows={5} />
      ) : isError ? (
        <ErrorBlock message={(error as Error).message} onRetry={() => refetch()} />
      ) : data ? (
        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={data.severity} />
              <StateBadge state={data.state} />
              {data.state !== "resolved" && (
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[color:var(--warning)]">
                  <StatusPulse status="degraded" /> ongoing
                </span>
              )}
            </div>

            <h2 className="mt-4 text-lg font-semibold">Timeline</h2>

            <ol className="mt-5 space-y-0">
              {data.timeline.map((event, i) => {
                const last = i === data.timeline.length - 1;
                const resolved = event.state === "resolved";
                return (
                  <li key={event.id} className="relative pb-7 pl-9 last:pb-0">
                    {!last && (
                      <span className="absolute left-[11px] top-6 h-full w-px bg-linear-to-b from-primary/50 to-accent/25" />
                    )}
                    <span
                      className="absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full border"
                      style={{
                        borderColor: resolved
                          ? "color-mix(in oklab, var(--emerald-core) 45%, transparent)"
                          : "color-mix(in oklab, var(--violet-core) 45%, transparent)",
                        background: resolved
                          ? "color-mix(in oklab, var(--emerald-core) 14%, transparent)"
                          : "color-mix(in oklab, var(--violet-core) 14%, transparent)",
                        color: resolved ? "var(--emerald-core)" : "var(--violet-core)",
                      }}
                    >
                      {resolved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                    </span>

                    <div className="glass rounded-xl p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StateBadge state={event.state} />
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {timeOf(event.at)} · {event.author}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground/90">{event.message}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <aside className="space-y-4">
            <div className="glass-panel rounded-2xl p-5">
              <p className="mono-label">Impact</p>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Monitor", data.monitorName],
                  ["Regions", data.affectedRegions.join(", ")],
                  ["Started", timeOf(data.startedAt)],
                  ["Duration", `${Math.floor(data.durationMinutes / 60)}h ${data.durationMinutes % 60}m`],
                  ["Resolved", data.resolvedAt ? timeOf(data.resolvedAt) : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-mono text-xs">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {data.rootCause && (
              <div className="glass-panel rounded-2xl p-5">
                <p className="mono-label">Root cause</p>
                <p className="mt-3 text-sm text-foreground/90">{data.rootCause}</p>
              </div>
            )}

            <div className="glass-panel rounded-2xl p-5">
              <p className="mono-label">Actions</p>
              <div className="mt-3 flex flex-col gap-2">
                <Button variant="hero" size="sm">Post update</Button>
                <Button variant="glass" size="sm">Mark resolved</Button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </DashboardShell>
  );
}
