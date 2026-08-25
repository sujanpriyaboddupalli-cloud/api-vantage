/**
 * Google Identity Services helper.
 *
 * VITE_GOOGLE_CLIENT_ID is a publishable OAuth client ID, so it lives in .env
 * and ships to the browser. When it is missing, the "Continue with Google"
 * button is hidden instead of failing at runtime.
 */
export const GOOGLE_CLIENT_ID: string = import.meta.env["VITE_GOOGLE_CLIENT_ID"] ?? "";

export const GOOGLE_ENABLED = GOOGLE_CLIENT_ID.length > 0;

interface GoogleAccounts {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
      }): void;
      renderButton(el: HTMLElement, options: Record<string, string | number>): void;
    };
  };
}

const SRC = "https://accounts.google.com/gsi/client";
let loader: Promise<GoogleAccounts> | null = null;

export function loadGoogleIdentity(): Promise<GoogleAccounts> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"));
  const existing = (window as unknown as { google?: GoogleAccounts }).google;
  if (existing?.accounts?.id) return Promise.resolve(existing);
  if (loader) return loader;

  loader = new Promise<GoogleAccounts>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const g = (window as unknown as { google?: GoogleAccounts }).google;
      if (g?.accounts?.id) resolve(g);
      else reject(new Error("Google Identity Services failed to initialise"));
    };
    script.onerror = () => reject(new Error("Could not reach Google sign-in"));
    document.head.appendChild(script);
  });
  return loader;
}

/** Decodes the (already-signed) ID token payload for display purposes only. */
export function decodeIdToken(credential: string): { email?: string; name?: string; picture?: string } {
  const part = credential.split(".")[1];
  if (!part) return {};
  const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
  try {
    return JSON.parse(decodeURIComponent(escape(json))) as { email?: string; name?: string };
  } catch {
    return {};
  }
}
