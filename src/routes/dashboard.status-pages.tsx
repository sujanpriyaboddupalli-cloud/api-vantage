import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { StatusPulse } from "@/components/dashboard/primitives";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/status-pages")({
  head: () => ({
    meta: [
      { title: "Status Pages — API Sentinel" },
      { name: "description", content: "Public status pages powered by your monitors and incident timelines." },
      { property: "og:title", content: "Status Pages — API Sentinel" },
      { property: "og:description", content: "Publish uptime transparency to your customers." },
    ],
  }),
  component: StatusPagesPage,
});

const pages = [
  { name: "status.acme.io", audience: "Public", monitors: 6, subscribers: 1284, state: "up" as const },
  { name: "internal.status.acme.io", audience: "Team only", monitors: 8, subscribers: 42, state: "degraded" as const },
];

function StatusPagesPage() {
  return (
    <DashboardShell
      title="Status Pages"
      description="Share uptime transparency with customers"
      actions={<Button variant="hero" size="sm">New status page</Button>}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {pages.map((p) => (
          <div key={p.name} className="glass-panel hover-glow rounded-2xl p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <StatusPulse status={p.state} />
                <p className="truncate font-mono text-sm">{p.name}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                ["Audience", p.audience],
                ["Monitors", String(p.monitors)],
                ["Subscribers", p.subscribers.toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="glass rounded-xl p-3">
                  <p className="mono-label">{k}</p>
                  <p className="mt-1 truncate text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
