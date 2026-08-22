import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Phone, Webhook } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — API Sentinel" },
      { name: "description", content: "Escalation policies and alert channels for on-call response." },
      { property: "og:title", content: "Alerts — API Sentinel" },
      { property: "og:description", content: "Route incidents to the right on-call channel." },
    ],
  }),
  component: AlertsPage,
});

const channels = [
  { name: "Email · oncall@acme.io", icon: Mail, on: true, detail: "All severities" },
  { name: "Slack · #incidents", icon: MessageSquare, on: true, detail: "Critical + major" },
  { name: "SMS · +1 (415) ••• 4412", icon: Phone, on: false, detail: "Critical only" },
  { name: "Webhook · pagerduty.events", icon: Webhook, on: true, detail: "Critical only" },
];

const escalation = [
  { step: "T+0m", action: "Notify primary on-call via Slack + email" },
  { step: "T+5m", action: "No ack → SMS primary, notify secondary" },
  { step: "T+15m", action: "No ack → page engineering manager" },
];

function AlertsPage() {
  return (
    <DashboardShell
      title="Alerts"
      description="Channels and escalation policy"
      actions={<Button variant="hero" size="sm">Add channel</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-base font-semibold">Channels</h2>
          <ul className="mt-4 divide-y divide-border/70">
            {channels.map((c) => (
              <li key={c.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-primary">
                  <c.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{c.detail}</p>
                </div>
                <Switch defaultChecked={c.on} aria-label={`Toggle ${c.name}`} />
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-base font-semibold">Escalation policy</h2>
          <ol className="mt-4 space-y-3">
            {escalation.map((e) => (
              <li key={e.step} className="glass rounded-xl p-4">
                <p className="font-mono text-[11px] text-primary">{e.step}</p>
                <p className="mt-1 text-sm">{e.action}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </DashboardShell>
  );
}
