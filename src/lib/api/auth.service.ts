import { apiFetch, delay, getToken, setToken, USE_MOCK_API } from "./client";
import { decodeIdToken } from "./google";
import {
  accountKey,
  getStoredUser,
  nameFromEmail,
  orgFromEmail,
  setStoredUser,
} from "./session";
import type { AuthSession, AuthUser } from "./types";

/** Builds the account record for an email so every mail gets its own workspace. */
function userFor(email: string, overrides: Partial<AuthUser> = {}): AuthUser {
  const key = accountKey(email);
  return {
    id: `usr_${key}`,
    name: nameFromEmail(key),
    email: key,
    org: orgFromEmail(key),
    plan: "free",
    ...overrides,
  };
}

export async function login(input: { email: string; password: string }): Promise<AuthSession> {
  if (USE_MOCK_API) {
    if (!input.email.includes("@")) throw new Error("Enter a valid email address");
    if (input.password.length < 6) throw new Error("Incorrect email or password");
    const session: AuthSession = {
      token: `mock.${accountKey(input.email)}`,
      user: userFor(input.email),
    };
    await delay(null, 700);
    setToken(session.token);
    setStoredUser(session.user);
    return session;
  }
  const session = await apiFetch<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(session.token);
  setStoredUser(session.user);
  return session;
}

export async function signup(input: {
  name: string;
  email: string;
  password: string;
  org: string;
}): Promise<AuthSession> {
  if (USE_MOCK_API) {
    if (input.password.length < 8) throw new Error("Password must be at least 8 characters");
    const session: AuthSession = {
      token: `mock.${accountKey(input.email)}`,
      user: userFor(input.email, {
        ...(input.name.trim() ? { name: input.name.trim() } : {}),
        ...(input.org.trim() ? { org: input.org.trim() } : {}),
      }),
    };
    await delay(null, 800);
    setToken(session.token);
    setStoredUser(session.user);
    return session;
  }
  const session = await apiFetch<AuthSession>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(session.token);
  setStoredUser(session.user);
  return session;
}

/** Exchanges a Google ID token for an API Sentinel session. */
export async function loginWithGoogle(credential: string): Promise<AuthSession> {
  if (USE_MOCK_API) {
    const claims = decodeIdToken(credential);
    if (!claims.email) throw new Error("Google did not return an email address");
    const session: AuthSession = {
      token: `mock.${accountKey(claims.email)}`,
      user: userFor(claims.email, claims.name ? { name: claims.name } : {}),
    };
    await delay(null, 400);
    setToken(session.token);
    setStoredUser(session.user);
    return session;
  }
  const session = await apiFetch<AuthSession>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  setToken(session.token);
  setStoredUser(session.user);
  return session;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (USE_MOCK_API) return delay(getToken() ? getStoredUser() : null, 200);
  return apiFetch<AuthUser>("/auth/me");
}

export function logout() {
  setToken(null);
  setStoredUser(null);
}
