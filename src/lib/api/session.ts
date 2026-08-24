import type { AuthUser } from "./types";

const USER_KEY = "api-sentinel.user";

/** The signed-in account, persisted so each email keeps its own workspace. */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function accountKey(email: string): string {
  return email.trim().toLowerCase();
}

export function initialsOf(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "");
  return (letters.join("") || source.slice(0, 2)).toUpperCase();
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join(" ");
}

export function orgFromEmail(email: string): string {
  const domain = email.split("@")[1] ?? "";
  const label = domain.split(".")[0] ?? "Personal";
  if (["gmail", "googlemail", "outlook", "hotmail", "yahoo", "icloud", "proton"].includes(label)) {
    return `${nameFromEmail(email)}'s workspace`;
  }
  return label ? label[0]!.toUpperCase() + label.slice(1) : "Personal";
}
