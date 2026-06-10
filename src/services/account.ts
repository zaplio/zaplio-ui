import { CORE_API_URL } from "./config";
import { authFetch } from "./http";
import type { ApiEnvelope, CreateAccountPayload, WaAccount } from "./types";

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

export async function listAccounts(userId?: string): Promise<WaAccount[]> {
  const url = new URL(`${CORE_API_URL}/api/v1/accounts`);
  if (userId) {
    url.searchParams.set("user_id", encodeURIComponent(userId));
  }
  const res = await authFetch(url.toString());
  return parseEnvelope<WaAccount[]>(res);
}

export async function createAccount(
  payload: CreateAccountPayload
): Promise<WaAccount> {
  const res = await authFetch(`${CORE_API_URL}/api/v1/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<WaAccount>(res);
}

export async function deleteAccount(id: string): Promise<void> {
  const res = await authFetch(
    `${CORE_API_URL}/api/v1/accounts/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  await parseEnvelope<unknown>(res);
}
