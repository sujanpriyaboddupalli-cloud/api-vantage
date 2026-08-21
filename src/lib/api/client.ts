/**
 * Single configurable API surface.
 *
 * Point VITE_API_BASE_URL at your Node.js/Express + MongoDB backend
 * (e.g. "http://localhost:4000" or "/api"), and set
 * VITE_USE_MOCK_API="false" to stop serving the local mock fixtures.
 */
export const API_BASE_URL: string = import.meta.env["VITE_API_BASE_URL"] ?? "/api";

export const USE_MOCK_API: boolean = import.meta.env["VITE_USE_MOCK_API"] !== "false";

export const AUTH_TOKEN_KEY = "api-sentinel.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  else window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Simulated network latency for mock fixtures. */
export function delay<T>(value: T, ms = 520): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
