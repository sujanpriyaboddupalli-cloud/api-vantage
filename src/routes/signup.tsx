import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignup } from "@/hooks/use-api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — API Sentinel" },
      {
        name: "description",
        content: "Start monitoring your APIs in under two minutes. Free tier, no credit card.",
      },
      { property: "og:title", content: "Create your account — API Sentinel" },
      { property: "og:description", content: "Free tier, no credit card required." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useSignup();
  const [form, setForm] = useState({ name: "", org: "", email: "", password: "" });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync(form);
      navigate({ to: "/dashboard" });
    } catch {
      /* surfaced via error */
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="10 monitors, 1-minute checks and incident timelines on the free tier."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="su-name">Full name</Label>
            <Input id="su-name" value={form.name} onChange={set("name")} placeholder="Ada Lovelace" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-org">Organization</Label>
            <Input id="su-org" value={form.org} onChange={set("org")} placeholder="Acme Platform" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-email">Work email</Label>
          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-password">Password</Label>
          <Input
            id="su-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            placeholder="At least 8 characters"
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
          {isPending ? "Creating workspace…" : "Create workspace"}
        </Button>
      </form>
    </AuthLayout>
  );
}
