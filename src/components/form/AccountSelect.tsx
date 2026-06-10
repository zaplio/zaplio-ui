import { useEffect, useRef, useState } from "react";
import type { WaAccount } from "../../services/types";

/** Label & color class untuk tiap status koneksi. */
const statusStyle: Record<
  string,
  { text: string; cls: string }
> = {
  connected: {
    text: "Terhubung",
    cls: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
  },
  disconnected: {
    text: "Terputus",
    cls: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400",
  },
  connecting: {
    text: "Menghubungkan...",
    cls: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400",
  },
};

function resolveStatus(status: string) {
  return (
    statusStyle[status] ?? {
      text: status,
      cls: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
    }
  );
}

/** Badge kecil (10px) di sebelah kanan — dipakai di dalam dropdown & trigger. */
function StatusMini({ status }: { status: string }) {
  const s = resolveStatus(status);
  return (
    <span
      className={`inline-flex shrink-0 ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full leading-tight ${s.cls}`}
    >
      {s.text}
    </span>
  );
}

// ─── Public props ─────────────────────────────────────────────

export interface AccountSelectProps {
  accounts: WaAccount[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Dropdown account WhatsApp **custom** — tiap opsi menampilkan
 * nama account + status badge (Terhubung / Terputus / Menghubungkan...).
 *
 * Menggantikan native `<select>` agar status bisa di-render sebagai badge,
 * bukan hanya teks polos.
 */
export default function AccountSelect({
  accounts,
  value,
  onChange,
  disabled = false,
  placeholder = "Pilih account",
}: AccountSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = accounts.find((a) => a.account_id === value);

  const noAccount = accounts.length === 0;

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-left shadow-theme-xs transition
          focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            open
              ? "border-brand-300 ring-3 ring-brand-500/10"
              : "border-gray-300 dark:border-gray-700"
          }
          dark:bg-gray-900 dark:text-white/90`}
      >
        {selected ? (
          <span className="flex items-center justify-between">
            <span className="truncate">
              {selected.account_name}
              {selected.account_alias
                ? ` (${selected.account_alias})`
                : ""}
            </span>
            <StatusMini status={selected.connect_status} />
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            {noAccount
              ? "Belum ada account — buat dulu di Kelola Account"
              : placeholder}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────── */}
      {open && (
        <div className="absolute left-0 z-50 mt-1 w-full overflow-hidden bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          {noAccount ? (
            <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
              Belum ada account tersedia.
            </div>
          ) : (
            accounts.map((a) => (
              <button
                key={a.account_id}
                type="button"
                onClick={() => {
                  onChange(a.account_id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm text-left transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  a.account_id === value
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : ""
                }`}
              >
                <span className="truncate">
                  {a.account_name}
                  {a.account_alias ? ` (${a.account_alias})` : ""}
                </span>
                <StatusMini status={a.connect_status} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
