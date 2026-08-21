import { apiFetch, delay, USE_MOCK_API } from "./client";
import { mockOverview } from "./mock-data";
import type { OverviewStats } from "./types";

export async function getOverview(): Promise<OverviewStats> {
  if (USE_MOCK_API) return delay(mockOverview);
  return apiFetch<OverviewStats>("/overview");
}
