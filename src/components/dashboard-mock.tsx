import { LatencyBars, Sparkline, StatusDot } from "./mock-charts";

const endpoints = [
  { name: "GET /v1/payments", region: "us-east-1", p95: "84ms", uptime: "99.998%", tone: "ok" as const },
  { name: "POST /v1/auth/token", region: "eu-west-1", p95: "112ms", uptime: "99.991%", tone: "ok" as const },
  { name: "GET /v1/inventory", region: "ap-south-1", p95: "347ms", uptime: "99.812%", tone: "warn" as const },
  { name: "GET /v1/webhooks/health", region: "us-west-2", p95: "61ms", uptime: "100.00%", tone: "ok" as const },
];

const bars = [46, 58, 51, 63, 49, 72, 55, 61, 47, 88, 52, 59, 44, 66, 53, 71, 48, 57, 62, 50, 68, 45, 60, 54];
const spark = [12, 18, 14, 22, 19, 27, 21, 30, 24, 33, 28, 38, 31, 42];

export function DashboardMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-xl">
      <div className="sweep-line absolute top-0 left-0 h-px w-1/3 bg-duo opacity-70" />

      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-incident/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="mono-label ml-3">sentinel · production</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot />
          <span className="font-mono text-[11px] text-primary">all systems operational</span>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {[
          { label: "Uptime · 30d", value: "99.994%", sub: "+0.012%" },
          { label: "p95 latency", value: "96ms", sub: "-14ms" },
          { label: "Checks / min", value: "48.2k", sub: "18 regions" },
        ].map((m) => (
          <div key={m.label} className="glass rounded-lg p-3">
            <p className="mono-label">{m.label}</p>
            <p className="mt-1 font-mono text-xl text-foreground">{m.value}</p>
            <p className="font-mono text-[11px] text-primary">{m.sub}</p>
            <Sparkline points={spark} className="mt-1 h-6" />
          </div>
        ))}
      </div>

      <div className="px-4 pb-2">
        <div className="glass rounded-lg p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="mono-label">response time · last 24h</p>
            <p className="font-mono text-[11px] text-muted-foreground">1 spike · 14:22 UTC</p>
          </div>
          <LatencyBars bars={bars} />
        </div>
      </div>

      <div className="divide-y divide-border/60 px-4 pb-4">
        {(compact ? endpoints.slice(0, 3) : endpoints).map((e) => (
          <div key={e.name} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <StatusDot tone={e.tone} />
              <span className="truncate font-mono text-xs text-foreground">{e.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-4 font-mono text-[11px] text-muted-foreground">
              <span className="hidden sm:inline">{e.region}</span>
              <span>{e.p95}</span>
              <span className={e.tone === "warn" ? "text-warning" : "text-primary"}>{e.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
