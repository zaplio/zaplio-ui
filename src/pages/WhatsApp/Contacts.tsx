import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getContacts } from "../../services/whatsapp";
import { listAccounts } from "../../services/account";
import { useAuth } from "../../context/AuthContext";
import type { ContactsResponse, WaAccount } from "../../services/types";

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function Contacts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<WaAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [data, setData] = useState<ContactsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccounts(user?.id)
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, [user?.id]);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accountId) {
      setError("Pilih account terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const res = await getContacts(accountId.trim());
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil kontak.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const contacts = data?.contacts ?? [];

  return (
    <div>
      <PageMeta title="Whatsapp Contact | Zaplio" description="Daftar kontak dari WhatsApp" />
      <PageBreadcrumb pageTitle="Whatsapp Contact" />

      <div className="space-y-6">
        <ComponentCard title="Cari Kontak" desc="Pilih WhatsApp Account.">
          <form onSubmit={handleFetch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>WhatsApp Account</Label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
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
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-5 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memuat..." : "Tampilkan"}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          )}
        </ComponentCard>

        {data && (
          <ComponentCard
            title={`Kontak — ${data.account_name || data.account_id}`}
            desc={`Status: ${data.connect_status} · ${contacts.length} kontak`}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Nama
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Nomor
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Short
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        Tidak ada kontak.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((c, i) => (
                      <TableRow key={`${c.phone}-${i}`}>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {c.name || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {c.phone}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {c.short || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        )}
      </div>
    </div>
  );
}
