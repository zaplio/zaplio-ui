import { CORE_API_URL } from "./config";
import { authFetch } from "./http";
import type {
  ApiEnvelope,
  CreateSegmentPayload,
  Segment,
  SegmentConditions,
  UpdateSegmentPayload,
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

export async function listSegments(userId?: string): Promise<Segment[]> {
  const url = new URL(`${CORE_API_URL}/api/v1/segments`);
  if (userId) {
    url.searchParams.set("user_id", userId);
  }
  const res = await authFetch(url.toString());
  return parseEnvelope<Segment[]>(res);
}

export async function createSegment(
  payload: CreateSegmentPayload
): Promise<Segment> {
  const res = await authFetch(`${CORE_API_URL}/api/v1/segments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<Segment>(res);
}

export async function updateSegment(
  id: string,
  patch: UpdateSegmentPayload
): Promise<Segment> {
  const res = await authFetch(
    `${CORE_API_URL}/api/v1/segments/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  return parseEnvelope<Segment>(res);
}

export async function deleteSegment(id: string): Promise<void> {
  const res = await authFetch(
    `${CORE_API_URL}/api/v1/segments/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  await parseEnvelope<unknown>(res);
}

export async function previewSegment(payload: {
  user_id: string;
  conditions: SegmentConditions;
}): Promise<{ count: number }> {
  const res = await authFetch(`${CORE_API_URL}/api/v1/segments/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<{ count: number }>(res);
}
