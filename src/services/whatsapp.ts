import { WHATSAPP_API_URL } from "./config";
import { authFetch } from "./http";
import type {
  ContactsResponse,
  GroupsResponse,
  SendMessagePayload,
  SendMessageResponse,
  WhatsAppError,
} from "./types";

// whatsapp-api mengembalikan object langsung (tanpa envelope status).
// Error berbentuk { error: { code, message } }.
async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body as WhatsAppError | null;
    throw new Error(
      err?.error?.message || `Request failed (${res.status})`
    );
  }
  return body as T;
}

export async function sendMessage(
  payload: SendMessagePayload
): Promise<SendMessageResponse> {
  const res = await authFetch(`${WHATSAPP_API_URL}/api/v1/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<SendMessageResponse>(res);
}

export async function getContacts(
  accountId: string
): Promise<ContactsResponse> {
  // Lewat /api/v1/wa/contacts agar Envoy route ke whatsapp-api
  // (prefix /api/v1/contacts tanpa /wa milik core-manager-api).
  // Envoy prefix_rewrite mengubahnya balik jadi /api/v1/contacts/:id untuk whatsapp-api.
  const res = await authFetch(
    `${WHATSAPP_API_URL}/api/v1/wa/contacts/${encodeURIComponent(accountId)}`
  );
  return handle<ContactsResponse>(res);
}

export async function getGroups(accountId: string): Promise<GroupsResponse> {
  const res = await authFetch(
    `${WHATSAPP_API_URL}/api/v1/groups/${encodeURIComponent(accountId)}`
  );
  return handle<GroupsResponse>(res);
}
