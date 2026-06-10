import { refreshTokenApi } from "./auth";
import { TOKEN_STORAGE_KEY } from "./config";

// ===== Session helpers =====

/** Seluruh session yang disimpan di localStorage. */
interface StoredSession {
  user: unknown;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { accessToken?: string };
    return session.accessToken ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { refreshToken?: string };
    return session.refreshToken ?? null;
  } catch {
    return null;
  }
}

function updateStoredTokens(
  accessToken: string,
  refreshToken?: string,
  expiresAt?: string
): void {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as StoredSession;
    session.accessToken = accessToken;
    if (refreshToken) session.refreshToken = refreshToken;
    if (expiresAt) session.expiresAt = expiresAt;
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // silently ignore
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// ===== Refresh-token state machine =====

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let refreshSubscribers: Array<(ok: boolean) => void> = [];

function onRefreshed(ok: boolean): void {
  refreshSubscribers.forEach((cb) => cb(ok));
  refreshSubscribers = [];
}

/** Panggil refresh — sukses update localStorage & dispatch event, gagal hapus session. */
async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await refreshTokenApi(refreshToken);
    updateStoredTokens(
      res.access_token,
      res.refresh_token,
      res.expires_at
    );

    // Dispatch custom event agar AuthContext bisa reload session.
    window.dispatchEvent(new CustomEvent("auth:token-refreshed"));
    return true;
  } catch {
    clearSession();
    window.dispatchEvent(new CustomEvent("auth:token-refreshed"));
    return false;
  }
}

/**
 * Coba refresh token. Concurrent call hanya memicu satu refresh sungguhan;
 * sisanya menunggu hasil yang sama.
 */
async function attemptRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    // Lagi proses refresh — antri.
    return new Promise<boolean>((resolve) => {
      refreshSubscribers.push(resolve);
    });
  }

  isRefreshing = true;
  refreshPromise = doRefresh().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  const ok = await refreshPromise;
  onRefreshed(ok);
  return ok;
}

// ===== authFetch =====

/**
 * Wrapper `fetch` untuk API privat (setiap hit setelah login).
 * Otomatis menyisipkan header `Authorization: Bearer <token>`.
 * Bila mendapat 401, otomatis coba refresh token lalu retry sekali.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(input, { ...init, headers });
  } catch {
    // Network error: CORS violation, DNS failure, connection refused, etc.
    // Backend sometimes returns 401 WITHOUT CORS headers, which makes fetch()
    // throw before we can read `res.status`. Try refreshing the token anyway.
    if (getRefreshToken()) {
      const refreshed = await attemptRefresh();
      if (refreshed) {
        // Retry original request with fresh token.
        const newToken = getAccessToken();
        const retryHeaders = new Headers(init.headers);
        if (newToken) {
          retryHeaders.set("Authorization", `Bearer ${newToken}`);
        }
        return fetch(input, { ...init, headers: retryHeaders });
      }
    }
    // Refresh gagal → session sudah dibersihkan oleh doRefresh(),
    // AuthContext akan mendeteksi perubahan dan ProtectedRoute
    // akan redirect ke /signin.
    throw new Error("Sesi telah berakhir. Silakan login kembali.");
  }

  // 401 + ada refresh token → coba refresh dulu
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      // Retry original request with new token.
      const newToken = getAccessToken();
      const retryHeaders = new Headers(init.headers);
      if (newToken) {
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
      }
      return fetch(input, { ...init, headers: retryHeaders });
    }
  }

  return res;
}
