import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { Monitor, MonitorStatus } from "@/lib/api/types";

/** Short WebAudio chirp — no asset files, works after any user interaction. */
function beep(from: number, to: number) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(to, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.52);
    osc.onended = () => void ctx.close();
  } catch {
    /* audio blocked — the toast still shows */
  }
}

/**
 * Watches monitor statuses between polls and announces transitions with a
 * toast + sound alert: falling tone for down, rising tone for recovered.
 */
export function useStatusAlerts(monitors: Monitor[] | undefined) {
  const previous = useRef<Map<string, MonitorStatus> | null>(null);

  useEffect(() => {
    if (!monitors) return;
    const next = new Map(monitors.map((m) => [m.id, m.status] as const));

    if (previous.current) {
      for (const m of monitors) {
        const before = previous.current.get(m.id);
        if (!before || before === m.status) continue;

        if (m.status === "down") {
          beep(660, 200);
          toast.error(`${m.name} is DOWN`, {
            description: `${m.url} — alert email sent to your account.`,
            duration: 10_000,
          });
        } else if (before === "down") {
          beep(420, 900);
          toast.success(`${m.name} RECOVERED`, {
            description: `Responding again in ${m.responseTimeMs}ms.`,
            duration: 8_000,
          });
        }
      }
    }

    previous.current = next;
  }, [monitors]);
}
