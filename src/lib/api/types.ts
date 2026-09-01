export type MonitorStatus = "up" | "degraded" | "down" | "paused";

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: "GET" | "POST" | "HEAD";
  region: string;
  intervalSeconds: number;
  status: MonitorStatus;
  responseTimeMs: number;
  uptime30d: number;
  lastCheckedAt: string;
  latencySeries: number[];
  alertEmail?: string;
}

export type IncidentSeverity = "critical" | "major" | "minor";
export type IncidentState = "investigating" | "identified" | "monitoring" | "resolved";

export interface IncidentEvent {
  id: string;
  at: string;
  state: IncidentState;
  author: string;
  message: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  monitorName: string;
  title: string;
  severity: IncidentSeverity;
  state: IncidentState;
  startedAt: string;
  resolvedAt: string | null;
  durationMinutes: number;
  affectedRegions: string[];
  rootCause?: string;
  timeline: IncidentEvent[];
}

export interface OverviewStats {
  uptimePercent: number;
  uptimeTrend: number;
  avgLatencyMs: number;
  latencyTrend: number;
  activeIncidents: number;
  monitorsTotal: number;
  monitorsPaused: number;
  latencySeries: { t: string; p50: number; p95: number }[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  org: string;
  plan: "free" | "pro" | "enterprise";
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
