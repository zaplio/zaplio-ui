import { CORE_API_URL } from "./config";
import { authFetch } from "./http";
import type {
  ApiEnvelope,
  CreateTagPayload,
  Tag,
  UpdateTagPayload,
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

export async function listTags(userId?: string): Promise<Tag[]> {
  const url = new URL(`${CORE_API_URL}/api/v1/tags`);
  if (userId) {
    url.searchParams.set("user_id", userId);
  }
  const res = await authFetch(url.toString());
  return parseEnvelope<Tag[]>(res);
}

export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  const res = await authFetch(`${CORE_API_URL}/api/v1/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<Tag>(res);
}

export async function updateTag(
  id: string,
  patch: UpdateTagPayload
): Promise<Tag> {
  const res = await authFetch(
    `${CORE_API_URL}/api/v1/tags/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  return parseEnvelope<Tag>(res);
}

export async function deleteTag(id: string): Promise<void> {
  const res = await authFetch(
    `${CORE_API_URL}/api/v1/tags/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  await parseEnvelope<unknown>(res);
}
