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
