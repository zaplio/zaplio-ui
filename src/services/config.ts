// Base URL backend Zaplio. Override via .env (VITE_*).
export const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8080";
export const WHATSAPP_API_URL =
  import.meta.env.VITE_WHATSAPP_API_URL ?? "http://localhost:8001";
export const QRSTREAMER_WS_URL =
  import.meta.env.VITE_QRSTREAMER_WS_URL ?? "ws://localhost:8002/ws";

export const CORE_API_URL =
  import.meta.env.VITE_CORE_API_URL ?? "http://localhost:8003";

export const TOKEN_STORAGE_KEY = "zaplio.auth";
