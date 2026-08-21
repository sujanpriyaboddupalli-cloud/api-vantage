import {
  Activity,
  BellRing,
  Globe2,
  Gauge,
  KeyRound,
  MonitorCheck,
  Check,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "./reveal";
import { DashboardMock } from "./dashboard-mock";
import { StatusDot } from "./mock-charts";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SectionLabel({ children }: { children: string }) {
  return (
    <span className="mono-label inline-flex items-center gap-2">
      <span className="h-px w-8 bg-duo" />
      {children}
    </span>
  );
}

/* ---------------- logo strip ---------------- */

const logos = ["VERTEX", "northwind", "Ridgeline", "LUMEN/OPS", "kestrel", "Halcyon"];

export function LogoStrip() {
  return (
    <section className="border-y border-border/60 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mono-label text-center">Trusted by platform teams at</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((l, i) => (
            <Reveal key={l} delay={i * 60}>
              <span className="font-display text-lg tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground">
                {l}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- features ---------------- */

const features = [
  {
    icon: MonitorCheck,
    title: "Uptime Monitoring",
    body: "HTTP, gRPC, TCP and browser checks every 10 seconds with multi-region consensus before an incident is declared.",
    metric: "10s interval · 3-region quorum",
  },
  {
    icon: Gauge,
    title: "Latency Analytics",
    body: "p50/p95/p99 breakdowns per route, with DNS, TLS handshake and TTFB isolated so you know which layer regressed.",
    metric: "p99 tracked to 1ms",
  },
  {
    icon: BellRing,
    title: "Incident Alerting",
    body: "Route alerts to Slack, Email, PagerDuty or webhooks with escalation policies, on-call rotations and noise suppression.",
    metric: "Slack · PagerDuty · Webhook",
  },
  {
    icon: Activity,
    title: "Public Status Pages",
    body: "Branded status pages on your own domain, auto-updated from live checks with subscriber notifications and incident timelines.",
    metric: "status.yourdomain.com",
  },
  {
    icon: KeyRound,
    title: "API Key & Auth Monitoring",
    body: "Track token expiry, OAuth refresh failures and 401/403 spikes before your customers open a support ticket.",
    metric: "JWT · OAuth2 · mTLS",
  },
  {
    icon: Globe2,
    title: "Global Monitoring Regions",
    body: "Probe from 18 regions across 5 continents and compare regional latency to catch edge and CDN degradation.",
    metric: "18 regions · 5 continents",
  },
];

export function Features() {
  return (
    <section id="product" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionLabel>Platform</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">
            Everything you need to prove your API is up — and explain it when it isn&apos;t.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <article className="glass hover-glow group h-full rounded-xl p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/60">
                  <f.icon className="h-4.5 w-4.5 text-primary" strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                <p className="mt-5 border-t border-border/70 pt-3 font-mono text-[11px] text-primary/90">
                  {f.metric}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */

const steps = [
  {
    n: "01",
    title: "Point us at your endpoints",
    body: "Import from an OpenAPI spec, paste a URL, or define checks as code in your repo. Assertions on status, body, schema and headers.",
    code: `sentinel check create \\
  --url https://api.acme.io/v1/health \\
  --assert status=200 --assert p95<200ms`,
  },
  {
    n: "02",
    title: "We probe from everywhere",
    body: "Distributed agents run your checks on a schedule from 18 regions, recording full timing waterfalls and response payloads.",
    code: `us-east-1   84ms  200 OK
eu-west-1  112ms  200 OK
ap-south-1 347ms  200 OK  ⚠ slow`,
  },
  {
    n: "03",
    title: "Get paged with context",
    body: "Alerts arrive with the failing assertion, the diff against baseline, and a link to the trace — not just a red dot.",
    code: `[INCIDENT] p95 breach · /v1/inventory
baseline 96ms → current 347ms (+261%)
escalated: on-call/platform`,
  },
];

export function HowItWorks() {
  return (
    <section className="relative border-y border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Instrumented in three steps.</h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="flex h-full flex-col">
                <span className="font-mono text-sm text-duo">{s.n}</span>
                <h3 className="mt-3 text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <pre className="glass mt-6 flex-1 overflow-x-auto rounded-lg p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <code>{s.code}</code>
                </pre>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- dashboard preview ---------------- */

export function DashboardPreview() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="orb -top-20 left-1/4 h-[420px] w-[420px]" style={{ background: "var(--violet-core)" }} />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <SectionLabel>The console</SectionLabel>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl sm:text-4xl">
            One console for uptime, latency and incidents.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Every check, every region, every regression — correlated on a single timeline your whole team can read.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="rounded-2xl bg-duo p-px">
            <div className="rounded-2xl bg-background/80 p-2 sm:p-4">
              <DashboardMock />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "/ forever",
    blurb: "For side projects and a first taste of real monitoring.",
    cta: "Start monitoring free",
    variant: "outline" as const,
    features: ["10 monitors", "5-minute check interval", "3 regions", "Email alerts", "7-day retention"],
  },
  {
    name: "Pro",
    price: "$49",
    cadence: "/ month",
    blurb: "For product teams running APIs customers depend on.",
    cta: "Start 14-day trial",
    variant: "hero" as const,
    highlight: true,
    features: [
      "200 monitors",
      "10-second check interval",
      "All 18 regions",
      "Slack, PagerDuty & webhooks",
      "1 branded status page",
      "90-day retention",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For platform orgs with compliance and scale requirements.",
    cta: "Talk to engineering",
    variant: "outline" as const,
    features: [
      "Unlimited monitors",
      "Private probe locations",
      "SSO / SCIM & audit logs",
      "SLA-backed 99.99% uptime",
      "Unlimited status pages",
      "13-month retention",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Per-seat pricing is a tax on visibility.</h2>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Unlimited team members on every plan. You pay for checks, not for the people reading them.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div
                className={
                  t.highlight
                    ? "rounded-xl bg-duo p-px shadow-glow-violet"
                    : "rounded-xl border border-border"
                }
              >
                <div className="glass-panel flex h-full flex-col rounded-xl p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg">{t.name}</h3>
                    {t.highlight && (
                      <span className="mono-label rounded-full border border-primary/40 px-2.5 py-1 text-primary">
                        most adopted
                      </span>
                    )}
                  </div>
                  <p className="mt-4 font-mono text-4xl text-foreground">
                    {t.price}
                    <span className="font-sans text-sm text-muted-foreground">{t.cadence}</span>
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{t.blurb}</p>
                  <ul className="mt-7 flex-1 space-y-3">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={t.variant} className="mt-8 w-full">
                    {t.cta}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- testimonials ---------------- */

const quotes = [
  {
    quote:
      "We cut mean time to detection from 11 minutes to 40 seconds. The regional breakdown found a CDN misroute our own tracing missed entirely.",
    name: "Priya Raghunathan",
    role: "Staff SRE, Vertex Payments",
    metric: "MTTD 11m → 40s",
  },
  {
    quote:
      "Checks-as-code in the same PR as the endpoint means monitoring never drifts from reality. It's the first observability tool our engineers actually maintain.",
    name: "Daniel Okafor",
    role: "Head of Platform, Northwind",
    metric: "1,240 checks in CI",
  },
  {
    quote:
      "The status page paid for the plan in one quarter. Support volume during incidents dropped by roughly two thirds.",
    name: "Marta Kellerman",
    role: "VP Engineering, Halcyon",
    metric: "-64% incident tickets",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionLabel>Social proof</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl">Run by the people who get paged.</h2>
        </Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 80}>
              <figure className="glass hover-glow flex h-full flex-col rounded-xl p-6">
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                  “{q.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-border/70 pt-4">
                  <p className="text-sm text-foreground">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.role}</p>
                  <p className="mt-3 font-mono text-[11px] text-primary">{q.metric}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const faqs = [
  {
    q: "How fast can API Sentinel detect an outage?",
    a: "On Pro and Enterprise plans checks run every 10 seconds from at least three regions. An incident is declared once a quorum of regions agrees, which typically puts detection under 30 seconds while avoiding false positives from a single flaky probe.",
  },
  {
    q: "Do you support private or internal APIs?",
    a: "Yes. Enterprise plans can run private probe agents inside your VPC or Kubernetes cluster. They report outbound over mTLS, so no inbound ingress is required.",
  },
  {
    q: "Can I define monitors as code?",
    a: "Monitors can be declared in YAML or TypeScript and applied from CI with the sentinel CLI or Terraform provider. Drift between your spec and deployed checks is reported on every run.",
  },
  {
    q: "What happens to my data and how long is it retained?",
    a: "Raw check results are retained for 7 days on Free, 90 days on Pro and up to 13 months on Enterprise. Aggregated uptime and latency rollups are kept for the life of the account.",
  },
  {
    q: "Which alerting integrations are included?",
    a: "Email and Slack on all paid plans, plus PagerDuty, Opsgenie, Microsoft Teams, Discord, SMS and generic signed webhooks. Escalation policies and maintenance windows are included at no extra cost.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-border/60 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl">Questions engineers actually ask.</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Still unsure? Read the{" "}
            <a href="#docs" className="text-primary underline-offset-4 hover:underline">
              documentation
            </a>{" "}
            or talk to a solutions engineer.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border/70">
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- CTA + footer ---------------- */

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="orb top-0 left-1/3 h-[380px] w-[380px]" style={{ background: "var(--emerald-core)" }} />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl">Know before your customers do.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Ten monitors, eighteen regions, zero credit card. Your first check runs in under two minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="lg">
              Start monitoring free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Book a technical demo
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const footerNav = [
  {
    heading: "Product",
    links: ["Uptime monitoring", "Latency analytics", "Incident alerting", "Status pages", "Monitoring regions"],
  },
  { heading: "Developers", links: ["Documentation", "API reference", "CLI", "Terraform provider", "Changelog"] },
  { heading: "Company", links: ["About", "Careers", "Security", "Trust center", "Contact"] },
  { heading: "Resources", links: ["SLA calculator", "Incident playbooks", "Blog", "Community", "Support"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2.4fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-duo" />
              <span className="font-display text-base">API Sentinel</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Distributed API monitoring and observability for teams who own the pager.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <StatusDot />
              <span className="font-mono text-[11px] text-muted-foreground">
                sentinel platform · 99.998% / 90d
              </span>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((col) => (
              <div key={col.heading}>
                <p className="mono-label">{col.heading}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-muted-foreground">
            © 2026 API Sentinel, Inc. · SOC 2 Type II · GDPR
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            Built for engineers, in Berlin & Seattle.
          </p>
        </div>
      </div>
    </footer>
  );
}
