import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { IncidentSeverity, IncidentState, MonitorStatus } from "@/lib/api/types";

export const statusTone: Record<MonitorStatus, { label: string; color: string }> = {
  up: { label: "Operational", color: "var(--emerald-core)" },
  degraded: { label: "Degraded", color: "var(--warning)" },
  down: { label: "Down", color: "var(--incident)" },
  paused: { label: "Paused", color: "var(--muted-foreground)" },
};

export function StatusPulse({ status, className }: { status: MonitorStatus; className?: string }) {
  const color = statusTone[status].color;
  const animate = status !== "paused";
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5 shrink-0", className)}>
      <span
        className={cn("block h-2.5 w-2.5 rounded-full", animate && "status-pulse")}
        style={{ color, background: color }}
      />
    </span>
  );
}

export function StatusBadge({ status }: { status: MonitorStatus }) {
  const { label, color } = statusTone[status];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        color,
      }}
    >
      <StatusPulse status={status} />
      {label}
    </span>
  );
}

const severityColor: Record<IncidentSeverity, string> = {
  critical: "var(--incident)",
  major: "var(--warning)",
  minor: "var(--violet-core)",
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const color = severityColor[severity];
  return (
    <span
      className="rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest"
      style={{
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        color,
      }}
    >
      {severity}
    </span>
  );
}

export function StateBadge({ state }: { state: IncidentState }) {
  const color = state === "resolved" ? "var(--emerald-core)" : "var(--magenta-core)";
  return (
    <span
      className="rounded-md px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider"
      style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      {state}
    </span>
  );
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  invertTrend,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  invertTrend?: boolean;
  icon: ReactNode;
}) {
  const good = trend === undefined ? true : invertTrend ? trend <= 0 : trend >= 0;
  const Icon = (trend ?? 0) >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="glass-panel hover-glow rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="mono-label">{label}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-primary">
          {icon}
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight">
        {value}
        {unit && <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span>}
      </p>
      {trend !== undefined && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 font-mono text-xs",
            good ? "text-primary" : "text-[color:var(--warning)]",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {trend > 0 ? "+" : ""}
          {trend}
          {trendLabel ? ` ${trendLabel}` : ""}
        </p>
      )}
    </div>
  );
}
