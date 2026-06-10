import { useCallback, useEffect, useRef, useState } from "react";
import { QRSTREAMER_WS_URL } from "../services/config";
import { getAccessToken } from "../services/http";
import type { WSMessage } from "../services/types";

export type QrStatus =
  | "idle"
  | "connecting"
  | "waiting_qr"
  | "qr_ready"
  | "connected"
  | "error"
  | "closed";

interface QrStreamState {
  status: QrStatus;
  qr: string | null; // raw QR string untuk dirender jadi QR image
  event: string | null; // pesan event_state terakhir
  error: string | null;
}

const initialState: QrStreamState = {
  status: "idle",
  qr: null,
  event: null,
  error: null,
};

/**
 * Hook untuk koneksi WebSocket ke qrstreamer.
 * connect(waId, userId) membuka ws://.../ws?wa_id=&user_id= lalu
 * menerima pesan qr_code / event_state / error secara real-time.
 */
export function useQrStream() {
  const [state, setState] = useState<QrStreamState>(initialState);
  const wsRef = useRef<WebSocket | null>(null);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState((s) => ({ ...s, status: "closed" }));
  }, []);

  const connect = useCallback(
    (waId: string, userId: string) => {
      // tutup koneksi lama bila ada
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setState({ ...initialState, status: "connecting" });

      // Browser tidak bisa set header Authorization pada handshake WebSocket,
      // jadi token dikirim lewat query `?token=`. Envoy (lua filter) yang mengubahnya
      // jadi header `Authorization: Bearer` sebelum divalidasi ke authcenterapi.
      const token = getAccessToken();
      const url =
        `${QRSTREAMER_WS_URL}?account_id=${encodeURIComponent(waId)}` +
        `&user_id=${encodeURIComponent(userId)}` +
        (token ? `&token=${encodeURIComponent(token)}` : "");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setState((s) => ({ ...s, status: "waiting_qr" }));
      };

      ws.onmessage = (ev) => {
        let msg: WSMessage;
        try {
          msg = JSON.parse(ev.data) as WSMessage;
        } catch {
          return;
        }

        switch (msg.type) {
          case "qr_code":
            setState((s) => ({ ...s, status: "qr_ready", qr: msg.data }));
            break;
          case "event_state":
            setState((s) => ({
              ...s,
              status: "connected",
              event: msg.data,
            }));
            break;
          case "error":
            setState((s) => ({ ...s, status: "error", error: msg.data }));
            break;
          case "ws_state":
          default:
            // ws_state = info koneksi awal, abaikan untuk UI
            break;
        }
      };

      ws.onerror = () => {
        setState((s) => ({
          ...s,
          status: "error",
          error: "WebSocket connection error",
        }));
      };

      ws.onclose = () => {
        setState((s) =>
          s.status === "connected" || s.status === "error"
            ? s
            : { ...s, status: "closed" }
        );
      };
    },
    []
  );

  // cleanup saat unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return { ...state, connect, disconnect };
}
