import { useMutation, useQuery } from "@tanstack/react-query";

import { login, signup } from "@/lib/api/auth.service";
import { getIncident, listIncidents } from "@/lib/api/incidents.service";
import { listMonitors } from "@/lib/api/monitors.service";
import { getOverview } from "@/lib/api/overview.service";

export const queryKeys = {
  overview: ["overview"] as const,
  monitors: ["monitors"] as const,
  incidents: ["incidents"] as const,
  incident: (id: string) => ["incidents", id] as const,
};

export function useOverview() {
  return useQuery({ queryKey: queryKeys.overview, queryFn: getOverview, refetchInterval: 30_000 });
}

export function useMonitors() {
  return useQuery({ queryKey: queryKeys.monitors, queryFn: listMonitors, refetchInterval: 30_000 });
}

export function useIncidents() {
  return useQuery({ queryKey: queryKeys.incidents, queryFn: listIncidents });
}

export function useIncident(id: string) {
  return useQuery({ queryKey: queryKeys.incident(id), queryFn: () => getIncident(id) });
}

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useSignup() {
  return useMutation({ mutationFn: signup });
}
