import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import QRCode from "react-qr-code";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useAuth } from "../../context/AuthContext";
import { useQrStream } from "../../hooks/useQrStream";
import { listAccounts } from "../../services/account";
import type { WaAccount } from "../../services/types";

const statusLabel: Record<string, { text: string; cls: string }> = {
  idle: { text: "Belum terhubung", cls: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400" },
  connecting: { text: "Menghubungkan...", cls: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400" },
  waiting_qr: { text: "Menunggu QR...", cls: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400" },
  qr_ready: { text: "QR siap discan", cls: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" },
  connected: { text: "Terhubung", cls: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400" },
  error: { text: "Error", cls: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400" },
  closed: { text: "Koneksi ditutup", cls: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400" },
};

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function QrConnect() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<WaAccount[]>([]);
  // Pre-select dari query param ?account_id= (saat datang dari daftar account)
  const [accountId, setAccountId] = useState(searchParams.get("account_id") ?? "");
  const { status, qr, event, error, connect, disconnect } = useQrStream();

  useEffect(() => {
    listAccounts(user?.id)
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, [user?.id]);

  const isStreaming =
    status === "connecting" || status === "waiting_qr" || status === "qr_ready";

  const handleConnect = () => {
    if (!accountId || !user) return;
    connect(accountId, user.id);
  };

  const badge = statusLabel[status] ?? statusLabel.idle;

  return (
    <div>
      <PageMeta
        title="Scan QR | Zaplio"
        description="Hubungkan device WhatsApp dengan scan QR code"
      />
      <PageBreadcrumb pageTitle="Scan QR WhatsApp" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComponentCard
          title="Connect Device"
          desc="Pilih WhatsApp Account lalu klik connect untuk mulai streaming QR."
        >
          <div className="space-y-5">
            <div>
              <Label>WhatsApp Account</Label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={isStreaming}
                className={selectClass}
              >
                <option value="" disabled>
                  {accounts.length === 0
                    ? "Belum ada account — buat dulu di Kelola Account"
                    : "Pilih account"}
                </option>
                {accounts.map((a) => (
                  <option key={a.account_id} value={a.account_id}>
                    {a.account_name}
                    {a.account_alias ? ` (${a.account_alias})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>User ID</Label>
              <Input value={user?.id ?? ""} disabled />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleConnect}
                disabled={!accountId || isStreaming}
                className="flex items-center justify-center px-5 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? "Menghubungkan..." : "Connect"}
              </button>
              <button
                onClick={disconnect}
                disabled={status === "idle" || status === "closed"}
                className="flex items-center justify-center px-5 py-3 text-sm font-medium text-gray-700 transition bg-white border rounded-lg ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
              >
                Disconnect
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Status:
              </span>
              <span
                className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${badge.cls}`}
              >
                {badge.text}
              </span>
            </div>

            {event && (
              <p className="text-sm text-success-600 dark:text-success-400">
                Event: {event}
              </p>
            )}
            {error && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {error}
              </p>
            )}
          </div>
        </ComponentCard>

        <ComponentCard
          title="QR Code"
          desc="Scan QR ini dari aplikasi WhatsApp (Linked Devices)."
        >
          <div className="flex flex-col items-center justify-center min-h-[260px]">
            {qr ? (
              <div className="p-4 bg-white rounded-xl">
                <QRCode value={qr} size={220} />
              </div>
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500">
                {status === "connected" ? (
                  <p className="text-success-600 dark:text-success-400">
                    Device sudah terhubung ✅
                  </p>
                ) : (
                  <p>QR akan muncul di sini setelah connect.</p>
                )}
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
