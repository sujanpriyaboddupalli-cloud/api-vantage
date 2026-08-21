import type { OverviewStats } from "@/lib/api/types";

function path(values: number[], max: number, w: number, h: number) {
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - (v / max) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function LatencyChart({ series }: { series: OverviewStats["latencySeries"] }) {
  const w = 100;
  const h = 42;
  const p50 = series.map((s) => s.p50);
  const p95 = series.map((s) => s.p95);
  const max = Math.max(...p95) * 1.15;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-56 w-full">
        <defs>
          <linearGradient id="p50fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--emerald-core)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--emerald-core)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="p95stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--violet-core)" />
            <stop offset="100%" stopColor="var(--magenta-core)" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={w}
            y1={h * f}
            y2={h * f}
            stroke="oklch(1 0 0 / 0.07)"
            strokeWidth="0.2"
          />
        ))}

        <path d={`${path(p50, max, w, h)} L${w},${h} L0,${h} Z`} fill="url(#p50fill)" />
        <path
          d={path(p50, max, w, h)}
          fill="none"
          stroke="var(--emerald-core)"
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={path(p95, max, w, h)}
          fill="none"
          stroke="url(#p95stroke)"
          strokeWidth="0.7"
          strokeDasharray="2 1.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 overflow-hidden">
        <div className="sweep-line h-full w-16 bg-linear-to-r from-transparent via-primary/12 to-transparent" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-[color:var(--emerald-core)]" /> p50
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-[color:var(--violet-core)]" /> p95
        </span>
        <span className="ml-auto font-mono">last 8h · 15m buckets</span>
      </div>
    </div>
  );
}
