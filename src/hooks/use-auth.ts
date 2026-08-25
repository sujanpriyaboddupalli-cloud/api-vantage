import { useEffect, useState } from "react";

import { getStoredUser, SESSION_EVENT } from "@/lib/api/session";
import type { AuthUser } from "@/lib/api/types";

/**
 * Reactive view of the signed-in account. Reads after mount only, so SSR and
 * hydration agree (localStorage isn't available on the server).
 */
export function useAuthUser(): { user: AuthUser | null; ready: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
    const sync = () => setUser(getStoredUser());
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready };
}
