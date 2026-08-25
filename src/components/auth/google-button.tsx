import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { loginWithGoogle } from "@/lib/api/auth.service";
import { GOOGLE_CLIENT_ID, GOOGLE_ENABLED, loadGoogleIdentity } from "@/lib/api/google";

/**
 * "Continue with Google". Renders the official Google button (required by GIS)
 * inside our glass styling; hidden entirely when no client ID is configured.
 */
export function GoogleButton({ label = "signin_with" }: { label?: "signin_with" | "signup_with" }) {
  const navigate = useNavigate();
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!GOOGLE_ENABLED) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !host.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response.credential) {
              setError("Google sign-in was cancelled");
              return;
            }
            setBusy(true);
            setError(null);
            try {
              await loginWithGoogle(response.credential);
              navigate({ to: "/dashboard" });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Google sign-in failed");
            } finally {
              setBusy(false);
            }
          },
        });
        google.accounts.id.renderButton(host.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: label,
          logo_alignment: "center",
          width: 320,
        });
      })
      .catch((err: Error) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [label, navigate]);

  if (!GOOGLE_ENABLED) return null;

  return (
    <div className="space-y-4">
      <div className="flex min-h-11 items-center justify-center">
        {busy ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Signing you in…
          </span>
        ) : (
          <div ref={host} className="[color-scheme:dark]" />
        )}
      </div>

      {error && (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="mono-label">or with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
