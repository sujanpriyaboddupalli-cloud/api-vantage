# API Guardian

Stage 1 — Design system + Landing Page only

Build API Sentinel — an enterprise-grade API monitoring and observability SaaS platform. This is a full-stack app: React (frontend) + Node.js/Express + MongoDB (backend). For this first message, only build the public marketing/landing page and design system — no dashboard or backend logic yet. Design it like a premium, well-funded developer-tools product (think Datadog, Better Stack, Checkly, Sentry) — not a generic template.

Brand & Design Direction

Aesthetic: Dark-mode-first, glassmorphism panels, subtle grid/noise background texture, glowing accent gradients, monospace accents for code/metrics, generous whitespace.

Color system — do NOT use blue as the accent color anywhere. Use an emerald green → violet/magenta duotone system instead: emerald (#10B981–#34D399) for positive/status-good/CTA elements, violet or magenta (#8B5CF6 / #D946EF) for gradients and highlights. Near-black base (#0A0B0F range), glass cards with soft white-8–12%-opacity borders. Keep amber/red reserved strictly for warning/incident states.

Typography: A distinctive display font for headlines (e.g. Space Grotesk or Clash Display) paired with a clean sans (Inter) for body — nothing that reads as a default Bootstrap/Tailwind starter.

Motion: Subtle scroll-reveal animations, hover glow on cards, animated gradient orbs in the hero background (emerald/violet, never blue), a live-looking "pulse" animation on status indicators.

This should feel premium and technical — avoid generic rounded-corner SaaS clichés. Reference the visual language of monitoring dashboards: sparkline charts, status dots, latency graphs, terminal-style code blocks.

3D element: Add a single 3D visual in the hero section using React Three Fiber (Three.js) — a slowly rotating abstract network/globe made of connected glowing nodes (representing monitored endpoints/servers), rendered in the emerald/violet palette, with a soft particle or wireframe look. Keep it subtle and slow-moving, not distracting. It should sit behind or beside the hero text and dashboard mockup, not replace them.

Performance: lazy-load the 3D canvas, cap it to a reasonable pixel ratio, and provide a static gradient/image fallback for mobile or low-power devices so the page doesn't lag.

Keep the 3D scope to this one hero element for Stage 1 — don't scatter 3D objects across every section, it'll slow the build and the page down.

Landing Page Sections

Nav: logo, Product / Pricing / Docs / Login, "Start Monitoring Free" CTA

Hero: bold headline about uptime/API reliability, subheadline, CTA buttons, the 3D network visual described above, and a live-looking animated dashboard mockup or status-check visual layered near it

Logo strip ("Trusted by teams at...")

Feature grid (6 cards): Uptime Monitoring, Latency Analytics, Incident Alerting (Slack/Email/PagerDuty), Public Status Pages, API Key & Auth Monitoring, Global Monitoring Regions

"How it works" 3-step section

Live dashboard preview section (large screenshot/mockup in a glass frame)

Pricing section: 3 tiers (Free / Pro / Enterprise) with feature comparison

Testimonials/social proof

FAQ accordion

Footer with sitemap links

Use realistic placeholder copy and mock metrics (uptime %, latency numbers) so nothing looks empty. Fully responsive. Confident, technical, built-for-engineers tone — not consumer-y, sounds like a devtools company wrote it.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9eaec5e4-89bc-4748-abda-43768d5a4046).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
