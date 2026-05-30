import { AUTH_API_URL } from "./config";
import type {
  ApiEnvelope,
  LoginResponse,
  Profile,
  RegisterPayload,
  User,
} from "./types";

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response
  }

  if (!res.ok || !body || body.status === false) {
    const msg =
      body?.error?.message || body?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body.data as T;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${AUTH_API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return parseEnvelope<LoginResponse>(res);
}

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await fetch(`${AUTH_API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<User>(res);
}

export async function getProfile(token: string): Promise<Profile> {
  const res = await fetch(`${AUTH_API_URL}/api/v1/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseEnvelope<Profile>(res);
}

export async function logoutRequest(token: string): Promise<void> {
  await fetch(`${AUTH_API_URL}/api/v1/user/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);
}
