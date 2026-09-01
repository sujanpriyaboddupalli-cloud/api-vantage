import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryKeys } from "@/hooks/use-api";
import { useAuthUser } from "@/hooks/use-auth";
import { createMonitor, updateMonitor } from "@/lib/api/monitors.service";
import type { Monitor } from "@/lib/api/types";

interface MonitorDialogProps {
  /** When provided the dialog edits this monitor instead of creating a new one. */
  monitor?: Monitor;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function MonitorDialog({ monitor, open, onOpenChange, trigger }: MonitorDialogProps) {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const [name, setName] = useState(monitor?.name ?? "");
  const [url, setUrl] = useState(monitor?.url ?? "");
  const [intervalSeconds, setInterval] = useState(String(monitor?.intervalSeconds ?? 60));
  const [alertEmail, setAlertEmail] = useState(monitor?.alertEmail ?? "");

  useEffect(() => {
    if (!isOpen) return;
    setName(monitor?.name ?? "");
    setUrl(monitor?.url ?? "");
    setInterval(String(monitor?.intervalSeconds ?? 60));
    setAlertEmail(monitor?.alertEmail ?? "");
  }, [isOpen, monitor]);

  const recipient = alertEmail.trim() || user?.email || "";

  const mutation = useMutation({
    mutationFn: (input: {
      name: string;
      url: string;
      method: Monitor["method"];
      intervalSeconds: number;
      expectedStatusCode: number;
      alertEmail: string;
    }) => (monitor ? updateMonitor(monitor.id, input) : createMonitor(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.monitors });
      qc.invalidateQueries({ queryKey: queryKeys.overview });
      toast.success(monitor ? "Monitor updated" : "Monitor created", {
        description: `Down and recovery alerts go to ${recipient}.`,
      });
      setOpen(false);
      if (!monitor) {
        setName("");
        setUrl("");
      }
    },
    onError: (err: Error) =>
      toast.error(monitor ? "Could not update monitor" : "Could not create monitor", {
        description: err.message,
      }),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : monitor ? null : (
        <DialogTrigger asChild>
          <Button variant="hero" size="sm">New monitor</Button>
        </DialogTrigger>
      )}
      <DialogContent className="glass-panel sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{monitor ? "Edit endpoint" : "Add an endpoint"}</DialogTitle>
          <DialogDescription>
            We check it on your schedule and email you the moment it goes down — and again when it
            recovers.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!recipient) {
              toast.error("Sign in first so we know where to send alerts");
              return;
            }
            mutation.mutate({
              name: name.trim() || url.trim(),
              url: url.trim(),
              method: monitor?.method ?? "GET",
              intervalSeconds: Number(intervalSeconds) || 60,
              expectedStatusCode: 200,
              alertEmail: recipient,
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="mon-name">Name</Label>
            <Input
              id="mon-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Checkout API"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mon-url">URL</Label>
            <Input
              id="mon-url"
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.acme.io/health"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mon-interval">Interval (s)</Label>
              <Input
                id="mon-interval"
                type="number"
                min={30}
                value={intervalSeconds}
                onChange={(e) => setInterval(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mon-email">Alert inbox</Label>
              <Input
                id="mon-email"
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder={user?.email ?? "you@company.com"}
              />
            </div>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            Alerts → {recipient || "sign in to set a recipient"}
          </p>

          <DialogFooter>
            <Button type="submit" variant="hero" disabled={mutation.isPending}>
              {mutation.isPending
                ? monitor
                  ? "Saving…"
                  : "Creating…"
                : monitor
                  ? "Save changes"
                  : "Create monitor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewMonitorDialog() {
  return <MonitorDialog />;
}
