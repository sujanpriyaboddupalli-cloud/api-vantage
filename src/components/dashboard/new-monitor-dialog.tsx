import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { createMonitor } from "@/lib/api/monitors.service";

export function NewMonitorDialog() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [intervalSeconds, setInterval] = useState("60");
  const [alertEmail, setAlertEmail] = useState("");

  const recipient = alertEmail.trim() || user?.email || "";

  const mutation = useMutation({
    mutationFn: createMonitor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.monitors });
      qc.invalidateQueries({ queryKey: queryKeys.overview });
      toast.success("Monitor created", {
        description: `Down and recovery alerts go to ${recipient}.`,
      });
      setOpen(false);
      setName("");
      setUrl("");
    },
    onError: (err: Error) => toast.error("Could not create monitor", { description: err.message }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm">New monitor</Button>
      </DialogTrigger>
      <DialogContent className="glass-panel sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an endpoint</DialogTitle>
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
              method: "GET",
              intervalSeconds: Number(intervalSeconds) || 60,
              expectedStatusCode: 200,
              alertEmail: recipient,
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="mon-name">Name</Label>
            <Input id="mon-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Checkout API" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mon-url">URL</Label>
            <Input
              id="mon-url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/health"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mon-interval">Check every (s)</Label>
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
              {mutation.isPending ? "Creating…" : "Create monitor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
