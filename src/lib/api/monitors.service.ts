import { apiFetch, delay, USE_MOCK_API } from "./client";
import { mockMonitors } from "./mock-data";
import type { Monitor } from "./types";

export async function listMonitors(): Promise<Monitor[]> {
  if (USE_MOCK_API) return delay(mockMonitors);
  return apiFetch<Monitor[]>("/monitors");
}

export async function getMonitor(id: string): Promise<Monitor> {
  if (USE_MOCK_API) {
    const found = mockMonitors.find((m) => m.id === id);
    if (!found) throw new Error("Monitor not found");
    return delay(found);
  }
  return apiFetch<Monitor>(`/monitors/${id}`);
}

export async function pauseMonitor(id: string): Promise<void> {
  if (USE_MOCK_API) return delay(undefined, 300);
  return apiFetch<void>(`/monitors/${id}/pause`, { method: "POST" });
}
