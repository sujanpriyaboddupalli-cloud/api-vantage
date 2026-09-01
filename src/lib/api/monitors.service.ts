import { apiFetch, delay, USE_MOCK_API } from "./client";
import { mockMonitors } from "./mock-data";
import { getStoredUser } from "./session";
import type { Monitor } from "./types";
import { getWorkspace, saveWorkspace } from "./workspace";

function localMonitors(): Monitor[] {
  const user = getStoredUser();
  return user ? getWorkspace(user.email).monitors : mockMonitors;
}

export async function listMonitors(): Promise<Monitor[]> {
  if (USE_MOCK_API) return delay(localMonitors());
  return apiFetch<Monitor[]>("/monitors");
}

export async function getMonitor(id: string): Promise<Monitor> {
  if (USE_MOCK_API) {
    const found = localMonitors().find((m) => m.id === id);
    if (!found) throw new Error("Monitor not found");
    return delay(found);
  }
  return apiFetch<Monitor>(`/monitors/${id}`);
}

export async function pauseMonitor(id: string): Promise<void> {
  if (USE_MOCK_API) {
    const user = getStoredUser();
    if (user) {
      const ws = getWorkspace(user.email);
      const target = ws.monitors.find((m) => m.id === id);
      if (target) target.status = target.status === "paused" ? "up" : "paused";
      saveWorkspace(ws);
    }
    return delay(undefined, 300);
  }
  return apiFetch<void>(`/monitors/${id}/pause`, { method: "POST" });
}

export interface NewMonitorInput {
  name: string;
  url: string;
  method: Monitor["method"];
  intervalSeconds: number;
  expectedStatusCode: number;
  /** Inbox that receives DOWN / RECOVERED alerts — defaults to the signed-in account. */
  alertEmail: string;
}

export async function createMonitor(input: NewMonitorInput): Promise<Monitor> {
  if (USE_MOCK_API) {
    const user = getStoredUser();
    const monitor: Monitor = {
      id: `mon_${Date.now().toString(36)}`,
      name: input.name,
      url: input.url,
      method: input.method,
      region: "us-east-1",
      intervalSeconds: input.intervalSeconds,
      status: "up",
      responseTimeMs: 0,
      uptime30d: 100,
      lastCheckedAt: new Date().toISOString(),
      latencySeries: [],
    };
    if (user) {
      const ws = getWorkspace(user.email);
      ws.monitors = [monitor, ...ws.monitors];
      saveWorkspace(ws);
    }
    return delay(monitor, 400);
  }
  return apiFetch<Monitor>("/monitors", { method: "POST", body: JSON.stringify(input) });
}
