import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../context/AuthContext";
import { listAccounts, createAccount, deleteAccount } from "../../services/account";
import type { WaAccount } from "../../services/types";

const connectStatusLabel: Record<string, { text: string; cls: string }> = {
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

function StatusBadge({ status }: { status: string }) {
  const badge = connectStatusLabel[status] ?? {
    text: status,
    cls: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${badge.cls}`}>
      {badge.text}
    </span>
  );
}

export default function Accounts() {
  const { user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();

  const [accounts, setAccounts] = useState<WaAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [accountName, setAccountName] = useState("");
  const [accountAlias, setAccountAlias] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAccounts(user?.id);
      setAccounts(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil daftar account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    setAccountName("");
    setAccountAlias("");
    setPhoneNumber("");
    setFormError(null);
    openModal();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!accountName.trim()) {
      setFormError("Nama account wajib diisi.");
      return;
    }
    if (!user) {
      setFormError("Anda harus login terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      await createAccount({
        user_id: user.id,
        account_name: accountName.trim(),
        account_alias: accountAlias.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
      });
      closeModal();
      await fetchAccounts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal membuat account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (account: WaAccount) => {
    const confirmed = window.confirm(
      `Hapus account "${account.account_name}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    try {
      await deleteAccount(account.account_id);
      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus account.");
    }
  };

  return (
    <div>
      <PageMeta title="Kelola Account | Zaplio" description="Kelola akun WhatsApp" />
      <PageBreadcrumb pageTitle="Kelola Account" />

      <div className="space-y-6">
        <ComponentCard
          title="Daftar Account WhatsApp"
          desc="Tambah, hapus, atau hubungkan account WhatsApp Anda."
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {accounts.length} account terdaftar
            </span>
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              + Tambah Account
            </button>
          </div>

          {error && (
            <p className="mb-4 text-sm text-error-600 dark:text-error-400">{error}</p>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Nama Account
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Alias
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Nomor HP
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                      Memuat...
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                      Belum ada account. Klik "Tambah Account" untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((acc) => (
                    <TableRow key={acc.account_id}>
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {acc.account_name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {acc.account_alias ?? "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {acc.phone_number ?? "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <StatusBadge status={acc.connect_status} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/wa/scan-qr?account_id=${encodeURIComponent(
                              acc.account_id
                            )}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition"
                          >
                            Scan QR
                          </Link>
                          <Link
                            to={`/wa/send-message?account_id=${encodeURIComponent(
                              acc.account_id
                            )}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition"
                          >
                            Kirim Pesan
                          </Link>
                          <button
                            onClick={() => handleDelete(acc)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>

      {/* Modal: Tambah Account */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-8 mx-4">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
          Tambah Account WhatsApp
        </h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <Label>
              Nama Account <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="contoh: Akun Sales"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <Label>Alias (opsional)</Label>
            <Input
              placeholder="contoh: sales-01"
              value={accountAlias}
              onChange={(e) => setAccountAlias(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <Label>Nomor HP (opsional)</Label>
            <Input
              placeholder="contoh: 628123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={submitting}
            />
          </div>

          {formError && (
            <p className="text-sm text-error-600 dark:text-error-400">{formError}</p>
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 transition bg-white border rounded-lg ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
