import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — API Sentinel" },
      {
        name: "description",
        content: "Sign in to API Sentinel to monitor endpoint uptime, latency and incidents.",
      },
      { property: "og:title", content: "Sign in — API Sentinel" },
      { property: "og:description", content: "Access your API monitoring workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ email, password });
      navigate({ to: "/dashboard" });
    } catch {
      /* surfaced via error */
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      subtitle="Pick up where you left off — 8 monitors, 2 open incidents."
      footer={
        <>
          No account yet?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create one free
          </Link>
        </>
      }
    >
      <GoogleButton label="signin_with" />

      <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="login-email">Work email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <span className="font-mono text-xs text-muted-foreground">forgot?</span>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        )}

        <Button type="submit" variant="hero" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center font-mono text-[11px] text-muted-foreground">
          SSO / SAML available on Enterprise
        </p>
      </form>
    </AuthLayout>
  );
}
