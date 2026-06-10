import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import AccountSelect from "../../components/form/AccountSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getGroups } from "../../services/whatsapp";
import { listAccounts } from "../../services/account";
import { useAuth } from "../../context/AuthContext";
import type { GroupsResponse, WaAccount } from "../../services/types";

export default function Groups() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<WaAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [data, setData] = useState<GroupsResponse | null>(null);
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
      const res = await getGroups(accountId.trim());
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil grup.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const groups = data?.groups ?? [];

  return (
    <div>
      <PageMeta title="Groups | Zaplio" description="Daftar grup WhatsApp" />
      <PageBreadcrumb pageTitle="List Group" />

      <div className="space-y-6">
        <ComponentCard title="Cari Grup" desc="Pilih WhatsApp Account.">
          <form onSubmit={handleFetch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>WhatsApp Account</Label>
              <AccountSelect
                accounts={accounts}
                value={accountId}
                onChange={setAccountId}
                placeholder="Pilih account"
              />
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
            title={`Grup — ${data.account_name || data.account_id}`}
            desc={`${groups.length} grup`}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Nama Grup
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      ID / Phone
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Short
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {groups.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        Tidak ada grup.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((g, i) => (
                      <TableRow key={`${g.phone}-${i}`}>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {g.name || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {g.phone}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {g.short || "-"}
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
