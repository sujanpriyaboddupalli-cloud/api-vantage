import { apiFetch, delay, getToken, setToken, USE_MOCK_API } from "./client";
import type { AuthSession, AuthUser } from "./types";

const MOCK_USER: AuthUser = {
  id: "usr_01",
  name: "Priya Nair",
  email: "priya@acme.io",
  org: "Acme Platform",
  plan: "pro",
};

export async function login(input: { email: string; password: string }): Promise<AuthSession> {
  if (USE_MOCK_API) {
    if (!input.email.includes("@")) throw new Error("Enter a valid email address");
    if (input.password.length < 6) throw new Error("Incorrect email or password");
    const session: AuthSession = {
      token: "mock.session.token",
      user: { ...MOCK_USER, email: input.email },
    };
    await delay(null, 700);
    setToken(session.token);
    return session;
  }
  const session = await apiFetch<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(session.token);
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
      token: "mock.session.token",
      user: { ...MOCK_USER, name: input.name, email: input.email, org: input.org, plan: "free" },
    };
    await delay(null, 800);
    setToken(session.token);
    return session;
  }
  const session = await apiFetch<AuthSession>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setToken(session.token);
  return session;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (USE_MOCK_API) return delay(getToken() ? MOCK_USER : MOCK_USER, 200);
  return apiFetch<AuthUser>("/auth/me");
}

export function logout() {
  setToken(null);
}
