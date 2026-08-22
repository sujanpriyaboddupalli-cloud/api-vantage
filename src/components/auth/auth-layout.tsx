import { Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid-bg noise relative min-h-screen overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb left-[-10%] top-[-8%] h-80 w-80 bg-primary" />
        <div className="orb bottom-[-12%] right-[-8%] h-96 w-96 bg-accent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-6">
        <Link to="/" className="mx-auto flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-duo text-primary-foreground">
            <Radar className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">API Sentinel</span>
        </Link>

        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <p className="mono-label">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <div className="text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </div>
  );
}
