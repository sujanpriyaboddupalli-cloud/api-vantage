import { apiFetch, delay, USE_MOCK_API } from "./client";
import { mockIncidents } from "./mock-data";
import type { Incident } from "./types";

export async function listIncidents(): Promise<Incident[]> {
  if (USE_MOCK_API) return delay(mockIncidents);
  return apiFetch<Incident[]>("/incidents");
}

export async function getIncident(id: string): Promise<Incident> {
  if (USE_MOCK_API) {
    const found = mockIncidents.find((i) => i.id === id);
    if (!found) throw new Error("Incident not found");
    return delay(found);
  }
  return apiFetch<Incident>(`/incidents/${id}`);
}
