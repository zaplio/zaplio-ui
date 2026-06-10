import { CORE_API_URL } from "./config";
import { authFetch } from "./http";
import type {
  ApiEnvelope,
  CoreContact,
  CreateCoreContactPayload,
} from "./types";

// Kontak milik user via core-manager-api (envelope {status,message,data,error}).
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

export async function listContacts(accountId?: string): Promise<CoreContact[]> {
  const url = new URL(`${CORE_API_URL}/api/v1/contacts`);
  if (accountId) {
    url.searchParams.set("account_id", accountId);
  }
  const res = await authFetch(url.toString());
  return parseEnvelope<CoreContact[]>(res);
}

export async function createContact(
  payload: CreateCoreContactPayload
): Promise<CoreContact> {
  const res = await authFetch(`${CORE_API_URL}/api/v1/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<CoreContact>(res);
}

export async function deleteContact(id: string): Promise<void> {
  const res = await authFetch(
    `${CORE_API_URL}/api/v1/contacts/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  await parseEnvelope<unknown>(res);
}
