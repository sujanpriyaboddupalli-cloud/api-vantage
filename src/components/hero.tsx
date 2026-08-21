import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "./hero-visual";
import { DashboardMock } from "./dashboard-mock";
import { Reveal } from "./reveal";
import { StatusDot } from "./mock-charts";

export function Hero() {
  return (
    <section id="top" className="noise relative overflow-hidden pt-32 pb-20 sm:pt-40">
      <div className="grid-bg absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div
        className="orb -top-32 -left-24 h-[520px] w-[520px]"
        style={{ background: "var(--emerald-core)" }}
      />
      <div
        className="orb top-10 right-0 h-[460px] w-[460px] [animation-delay:-6s]"
        style={{ background: "var(--violet-core)" }}
      />
      <div
        className="orb top-64 left-1/3 h-[360px] w-[360px] opacity-30 [animation-delay:-11s]"
        style={{ background: "var(--magenta-core)" }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10">
          <Reveal>
            <div className="glass inline-flex items-center gap-2.5 rounded-full px-3 py-1.5">
              <StatusDot />
              <span className="font-mono text-[11px] text-muted-foreground">
                18 regions · 48.2k checks/min · 99.998% platform uptime
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 max-w-xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Your API is down.
              <br />
              <span className="text-duo">You&apos;ll know in 30 seconds.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              API Sentinel probes every endpoint you own from 18 global regions, isolates DNS, TLS and
              TTFB regressions down to the millisecond, and pages the right engineer with the failing
              assertion attached.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button variant="hero" size="lg">
                Start Monitoring Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="glass" size="lg">
                <Terminal className="h-4 w-4" />
                Read the docs
              </Button>
            </div>
            <p className="mono-label mt-4">No credit card · 10 monitors free forever</p>
          </Reveal>

          <Reveal delay={300}>
            <pre className="glass mt-10 max-w-lg overflow-x-auto rounded-lg p-4 font-mono text-[11px] leading-relaxed">
              <code className="text-muted-foreground">
                <span className="text-primary">$</span> npx sentinel watch api.acme.io{"\n"}
                <span className="text-accent">→</span> 12 endpoints discovered from openapi.json{"\n"}
                <span className="text-accent">→</span> probing us-east-1 eu-west-1 ap-south-1{"\n"}
                <span className="text-primary">✓</span> live · p95 96ms · 0 failing assertions
              </code>
            </pre>
          </Reveal>
        </div>

        <div className="relative min-h-[420px] lg:min-h-[560px]">
          <HeroVisual />
          <Reveal delay={200} className="relative z-10 lg:mt-10">
            <DashboardMock compact />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
