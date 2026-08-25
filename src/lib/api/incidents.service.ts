import { apiFetch, delay, USE_MOCK_API } from "./client";
import { mockIncidents } from "./mock-data";
import { getStoredUser } from "./session";
import type { Incident } from "./types";
import { getWorkspace } from "./workspace";

function localIncidents(): Incident[] {
  const user = getStoredUser();
  return user ? getWorkspace(user.email).incidents : mockIncidents;
}

export async function listIncidents(): Promise<Incident[]> {
  if (USE_MOCK_API) return delay(localIncidents());
  return apiFetch<Incident[]>("/incidents");
}

export async function getIncident(id: string): Promise<Incident> {
  if (USE_MOCK_API) {
    const found = localIncidents().find((i) => i.id === id);
    if (!found) throw new Error("Incident not found");
    return delay(found);
  }
  return apiFetch<Incident>(`/incidents/${id}`);
}
