import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthUser } from "@/hooks/use-auth";
import { API_BASE_URL, USE_MOCK_API } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — API Sentinel" },
      { name: "description", content: "Workspace, API and notification settings for API Sentinel." },
      { property: "og:title", content: "Settings — API Sentinel" },
      { property: "og:description", content: "Manage workspace and API configuration." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, ready } = useAuthUser();

  return (
    <DashboardShell title="Settings" description={`Workspace · ${user?.org ?? "—"}`}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-base font-semibold">Workspace</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Organization name</Label>
              {ready && <Input id="ws-name" defaultValue={user?.org ?? ""} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-owner">Owner email</Label>
              {ready && <Input id="ws-owner" defaultValue={user?.email ?? ""} type="email" />}
            </div>
            <Button variant="hero" size="sm">Save changes</Button>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-base font-semibold">Backend connection</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Data is served through service functions hitting a single base URL.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">API_BASE_URL</dt>
              <dd className="truncate font-mono text-xs">{API_BASE_URL}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Mode</dt>
              <dd className="font-mono text-xs">{USE_MOCK_API ? "mock fixtures" : "live backend"}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg border border-border bg-white/[0.03] p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            VITE_API_BASE_URL=https://api.yourdomain.com
            <br />
            VITE_USE_MOCK_API=false
          </p>
        </section>

        <section className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Preferences</h2>
          <ul className="mt-4 divide-y divide-border/70">
            {[
              ["Weekly uptime digest", "Emailed every Monday at 09:00 UTC", true],
              ["Maintenance windows", "Suppress alerts during scheduled windows", true],
              ["Anonymous usage analytics", "Help us improve check scheduling", false],
            ].map(([title, desc, on]) => (
              <li key={String(title)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{title as string}</p>
                  <p className="truncate text-xs text-muted-foreground">{desc as string}</p>
                </div>
                <Switch defaultChecked={on as boolean} aria-label={title as string} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
