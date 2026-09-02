import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Pause, Play, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/dashboard/primitives";
import { DashboardShell } from "@/components/dashboard/shell";
import { MonitorDialog, NewMonitorDialog } from "@/components/dashboard/new-monitor-dialog";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/dashboard/states";
import { Sparkline } from "@/components/mock-charts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { queryKeys, useMonitors } from "@/hooks/use-api";
import { deleteMonitor, pauseMonitor } from "@/lib/api/monitors.service";
import type { Monitor } from "@/lib/api/types";

export const Route = createFileRoute("/dashboard/monitors")({
  head: () => ({
    meta: [
      { title: "Monitors — API Sentinel" },
      { name: "description", content: "Every monitored endpoint with status, response time and uptime." },
      { property: "og:title", content: "Monitors — API Sentinel" },
      { property: "og:description", content: "Status, response time and uptime for every endpoint." },
    ],
  }),
  component: MonitorsPage,
});

function ago(iso: string) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}

function MonitorsPage() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useMonitors();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Monitor | null>(null);
  const [deleting, setDeleting] = useState<Monitor | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.monitors });
    qc.invalidateQueries({ queryKey: queryKeys.overview });
  };

  const pauseMutation = useMutation({
    mutationFn: pauseMonitor,
    onSuccess: invalidate,
    onError: (err: Error) => toast.error("Could not update monitor", { description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMonitor,
    onSuccess: (_v, id) => {
      invalidate();
      toast.success("Monitor deleted", { description: `Removed ${id} and its incidents.` });
      setDeleting(null);
    },
    onError: (err: Error) => toast.error("Could not delete monitor", { description: err.message }),
  });

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (m) =>
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.url.toLowerCase().includes(q.toLowerCase()),
      ),
    [data, q],
  );

  return (
    <DashboardShell
      title="Monitors"
      description={`${data?.length ?? 0} endpoints across 6 regions`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            aria-label="Refresh monitors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <NewMonitorDialog />
        </div>
      }
    >
      <div className="glass-panel rounded-2xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name or URL"
              className="pl-9"
              aria-label="Filter monitors"
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {rows.length} shown
          </span>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingBlock rows={5} />
          ) : isError ? (
            <ErrorBlock message={(error as Error).message} onRetry={() => refetch()} />
          ) : !rows.length ? (
            <EmptyBlock
              title="No monitors match"
              description="Try a different search term, or create a monitor for a new endpoint."
              action={<Button variant="glass" size="sm" onClick={() => setQ("")}>Clear filter</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="text-left">
                    {["Endpoint", "Status", "Response", "Trend", "Uptime 30d", "Last checked"].map((h) => (
                      <th key={h} className="mono-label pb-3 pr-4 font-normal">
                        {h}
                      </th>
                    ))}
                    <th className="pb-3 text-right font-normal" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => (
                    <tr key={m.id} className="border-t border-border/70 transition-colors hover:bg-white/[0.03]">
                      <td className="max-w-[280px] py-4 pr-4">
                        <p className="truncate font-medium">{m.name}</p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {m.method} {m.url}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-4 pr-4 font-mono">
                        {m.status === "paused" || m.status === "down" ? "—" : `${m.responseTimeMs}ms`}
                      </td>
                      <td className="w-32 py-4 pr-4">
                        <Sparkline
                          points={m.latencySeries}
                          stroke={m.status === "up" ? "var(--emerald-core)" : "var(--warning)"}
                        />
                      </td>
                      <td className="py-4 pr-4 font-mono">{m.uptime30d.toFixed(3)}%</td>
                      <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">
                        {ago(m.lastCheckedAt)}
                      </td>
                      <td className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${m.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-panel">
                            <DropdownMenuItem onSelect={() => setEditing(m)}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => pauseMutation.mutate(m.id)}>
                              {m.status === "paused" ? (
                                <><Play className="h-4 w-4" /> Resume</>
                              ) : (
                                <><Pause className="h-4 w-4" /> Pause</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDeleting(m)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
