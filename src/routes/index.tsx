import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import {
  ClosingCta,
  DashboardPreview,
  Faq,
  Features,
  Footer,
  HowItWorks,
  LogoStrip,
  Pricing,
  Testimonials,
} from "@/components/landing-sections";

const title = "API Sentinel — API Monitoring & Observability for Engineers";
const description =
  "Probe every API endpoint from 18 global regions, catch latency regressions to the millisecond, and page the right engineer in under 30 seconds.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <LogoStrip />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <Pricing />
        <Testimonials />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
