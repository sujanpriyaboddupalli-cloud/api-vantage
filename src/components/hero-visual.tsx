import { Suspense, lazy, useEffect, useState } from "react";

const HeroNetwork = lazy(() => import("./hero-network"));

function GradientFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="h-[70%] w-[70%] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-duo)" }}
      />
    </div>
  );
}

/** Lazy, capability-gated 3D hero visual with a static gradient fallback. */
export function HeroVisual() {
  const [enable3d, setEnable3d] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowPower =
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      nav.connection?.saveData === true;

    if (lowPower) return;

    const idle = window.setTimeout(() => setEnable3d(true), 250);
    return () => window.clearTimeout(idle);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {enable3d ? (
        <Suspense fallback={<GradientFallback />}>
          <HeroNetwork />
        </Suspense>
      ) : (
        <GradientFallback />
      )}
    </div>
  );
}
