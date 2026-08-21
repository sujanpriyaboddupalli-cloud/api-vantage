import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  className,
  stroke = "var(--emerald-core)",
}: {
  points: number[];
  className?: string;
  stroke?: string;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 30 - ((p - min) / span) * 26 - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn("h-8 w-full", className)}>
      <path d={`${d} L100,30 L0,30 Z`} fill={stroke} opacity="0.12" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function StatusDot({ tone = "ok" }: { tone?: "ok" | "warn" | "down" }) {
  const color =
    tone === "ok" ? "var(--emerald-core)" : tone === "warn" ? "var(--warning)" : "var(--incident)";
  return (
    <span className="relative inline-flex h-2 w-2 items-center justify-center">
      <span className="status-pulse block h-2 w-2 rounded-full" style={{ color, background: color }} />
    </span>
  );
}

export function LatencyBars({ bars }: { bars: number[] }) {
  return (
    <div className="flex h-16 items-end gap-[3px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className="bar-live flex-1 rounded-[1px]"
          style={{
            height: `${h}%`,
            animationDelay: `${(i % 7) * 0.18}s`,
            background:
              h > 82
                ? "var(--warning)"
                : `linear-gradient(to top, color-mix(in oklab, var(--emerald-core) 30%, transparent), var(--emerald-core))`,
          }}
        />
      ))}
    </div>
  );
}
