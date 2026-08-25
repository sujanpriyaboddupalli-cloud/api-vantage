import { apiFetch, delay, USE_MOCK_API } from "./client";
import { mockOverview } from "./mock-data";
import { getStoredUser } from "./session";
import type { OverviewStats } from "./types";
import { overviewFor } from "./workspace";

export async function getOverview(): Promise<OverviewStats> {
  if (USE_MOCK_API) {
    const user = getStoredUser();
    return delay(user ? overviewFor(user.email) : mockOverview);
  }
  return apiFetch<OverviewStats>("/overview");
}
