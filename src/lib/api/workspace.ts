/**
 * Per-account workspace used while VITE_USE_MOCK_API is on.
 *
 * Each signed-in email address gets its OWN deterministic set of monitors,
 * incidents and overview stats (persisted in localStorage), so two accounts
 * never see the same dashboard. When VITE_USE_MOCK_API="false" none of this
 * runs — the service layer calls the Express/MongoDB API instead.
 */
import { accountKey, orgFromEmail } from "./session";
import type { Incident, Monitor, MonitorStatus, OverviewStats } from "./types";

const STORE_KEY = "api-sentinel.workspaces";

interface Workspace {
  email: string;
  createdAt: string;
  monitors: Monitor[];
  incidents: Incident[];
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

const SERVICES = [
  { name: "Checkout API", path: "/v2/checkout", method: "POST" as const, base: 140 },
  { name: "Auth Gateway", path: "/oauth/token", method: "POST" as const, base: 320 },
  { name: "Search Cluster", path: "/v2/search", method: "GET" as const, base: 210 },
  { name: "Webhook Dispatcher", path: "/hooks/dispatch", method: "POST" as const, base: 260 },
  { name: "Billing Worker", path: "/v2/billing/health", method: "GET" as const, base: 96 },
  { name: "Edge CDN", path: "/ping", method: "HEAD" as const, base: 44 },
  { name: "GraphQL Edge", path: "/graphql", method: "POST" as const, base: 180 },
  { name: "Reports Export", path: "/v2/reports/export", method: "GET" as const, base: 420 },
  { name: "Notifications", path: "/v2/notifications", method: "POST" as const, base: 130 },
  { name: "Media Pipeline", path: "/v2/media/transcode", method: "POST" as const, base: 510 },
];

const REGIONS = ["us-east-1", "eu-west-1", "us-west-2", "ap-south-1", "eu-central-1", "global"];

function apiHost(email: string): string {
  const domain = (email.split("@")[1] ?? "acme.io").toLowerCase();
  const generic = ["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
  if (generic.includes(domain)) {
    const local = (email.split("@")[0] ?? "app").replace(/[^a-z0-9]/gi, "").toLowerCase();
    return `api.${local || "app"}.dev`;
  }
  return `api.${domain}`;
}

function generate(email: string): Workspace {
  const key = accountKey(email);
  const seed = hash(key);
  const rand = rng(seed);
  const host = apiHost(key);
  const now = Date.now();

  const count = 4 + Math.floor(rand() * 5); // 4–8 monitors
  const picked = [...SERVICES].sort(() => rand() - 0.5).slice(0, count);

  const monitors: Monitor[] = picked.map((svc, i) => {
    const roll = rand();
    const status: MonitorStatus =
      i === 0 && roll > 0.82 ? "down" : roll > 0.78 ? "degraded" : roll < 0.07 ? "paused" : "up";
    const base = Math.round(svc.base * (0.7 + rand() * 0.8));
    const factor = status === "degraded" ? 2.4 : status === "down" ? 0 : 1;
    return {
      id: `mon_${seed.toString(36)}_${i}`,
      name: svc.name,
      url: `https://${host}${svc.path}`,
      method: svc.method,
      region: REGIONS[Math.floor(rand() * REGIONS.length)]!,
      intervalSeconds: [30, 60, 120, 300][Math.floor(rand() * 4)]!,
      status,
      responseTimeMs: Math.round(base * factor),
      uptime30d: Number(
        (status === "down" ? 97 + rand() * 1.6 : 99.2 + rand() * 0.79).toFixed(3),
      ),
      lastCheckedAt: new Date(now - Math.floor(rand() * 90_000)).toISOString(),
      latencySeries: Array.from({ length: 28 }, () =>
        Math.max(8, Math.round(base * factor + (rand() - 0.5) * base * 0.7)),
      ),
    };
  });

  const troubled = monitors.filter((m) => m.status === "down" || m.status === "degraded");
  const incidents: Incident[] = troubled.map((m, i) => {
    const startedAt = new Date(now - (18 + Math.floor(rand() * 240)) * 60_000);
    const open = m.status === "down" || rand() > 0.5;
    const resolvedAt = open ? null : new Date(startedAt.getTime() + 34 * 60_000);
    return {
      id: `inc_${seed.toString(36)}_${i}`,
      monitorId: m.id,
      monitorName: m.name,
      title:
        m.status === "down"
          ? `${m.name} returning 5xx errors`
          : `Elevated latency on ${m.name}`,
      severity: m.status === "down" ? "critical" : "major",
      state: open ? (rand() > 0.5 ? "identified" : "investigating") : "resolved",
      startedAt: startedAt.toISOString(),
      resolvedAt: resolvedAt ? resolvedAt.toISOString() : null,
      durationMinutes: Math.round(
        ((resolvedAt?.getTime() ?? now) - startedAt.getTime()) / 60_000,
      ),
      affectedRegions: [m.region],
      ...(resolvedAt ? { rootCause: "Connection pool saturation under peak write load." } : {}),
      timeline: [
        {
          id: `evt_${i}_1`,
          at: startedAt.toISOString(),
          state: "investigating",
          author: "API Sentinel",
          message: `Opened automatically after 3 consecutive failed checks on ${m.url}.`,
        },
        {
          id: `evt_${i}_2`,
          at: new Date(startedAt.getTime() + 9 * 60_000).toISOString(),
          state: "identified",
          author: orgFromEmail(key),
          message: "On-call acknowledged. Traced to upstream dependency timeouts.",
        },
        ...(resolvedAt
          ? [
              {
                id: `evt_${i}_3`,
                at: resolvedAt.toISOString(),
                state: "resolved" as const,
                author: "API Sentinel",
                message: "Endpoint recovered and checks are green. Auto-resolved.",
              },
            ]
          : [
              {
                id: `evt_${i}_3`,
                at: new Date(startedAt.getTime() + 21 * 60_000).toISOString(),
                state: "monitoring" as const,
                author: orgFromEmail(key),
                message: "Mitigation deployed — watching error rate before closing.",
              },
            ]),
      ],
    };
  });

  return { email: key, createdAt: new Date().toISOString(), monitors, incidents };
}

function readStore(): Record<string, Workspace> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "{}") as Record<string, Workspace>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, Workspace>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getWorkspace(email: string): Workspace {
  const key = accountKey(email);
  const store = readStore();
  const existing = store[key];
  if (existing) return existing;
  const created = generate(key);
  store[key] = created;
  writeStore(store);
  return created;
}

export function saveWorkspace(ws: Workspace) {
  const store = readStore();
  store[ws.email] = ws;
  writeStore(store);
}

export function overviewFor(email: string): OverviewStats {
  const ws = getWorkspace(email);
  const active = ws.monitors.filter((m) => m.status !== "paused");
  const uptimePercent = active.length
    ? Number((active.reduce((a, m) => a + m.uptime30d, 0) / active.length).toFixed(3))
    : 100;
  const latencies = active.map((m) => m.responseTimeMs).filter((v) => v > 0);
  const avgLatencyMs = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;

  const seed = hash(accountKey(email));
  const rand = rng(seed + 7);
  const latencySeries = Array.from({ length: 24 }, (_, i) => {
    const drift = (rand() - 0.45) * avgLatencyMs * 0.4;
    const p50 = Math.max(12, Math.round(avgLatencyMs + drift));
    return {
      t: new Date(Date.now() - (24 - i) * 3_600_000).toISOString(),
      p50,
      p95: Math.round(p50 * (1.6 + rand() * 0.6)),
    };
  });

  return {
    uptimePercent,
    uptimeTrend: Number(((rand() - 0.4) * 0.3).toFixed(3)),
    avgLatencyMs,
    latencyTrend: Math.round((rand() - 0.5) * 40),
    activeIncidents: ws.incidents.filter((i) => i.state !== "resolved").length,
    monitorsTotal: ws.monitors.length,
    monitorsPaused: ws.monitors.length - active.length,
    latencySeries,
  };
}
