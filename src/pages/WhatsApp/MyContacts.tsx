import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import AccountSelect from "../../components/form/AccountSelect";
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
import {
  listContacts,
  createContact,
  deleteContact,
} from "../../services/contact";
import { listAccounts } from "../../services/account";
import type { CoreContact, WaAccount } from "../../services/types";

const thClass =
  "px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400";

export default function MyContacts() {
  const { user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();

  const [contacts, setContacts] = useState<CoreContact[]>([]);
  const [accounts, setAccounts] = useState<WaAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [accountId, setAccountId] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Map account_id -> nama akun untuk ditampilkan di tabel
  const accountNameById = useMemo(() => {
    const map: Record<string, string> = {};
    accounts.forEach((a) => (map[a.account_id] = a.account_name));
    return map;
  }, [accounts]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsRes, accountsRes] = await Promise.all([
        listContacts(),
        listAccounts(user?.id),
      ]);
      // Tampilkan hanya kontak milik user yang login
      setContacts(
        user ? contactsRes.filter((c) => c.user_id === user.id) : contactsRes
      );
      setAccounts(accountsRes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil daftar kontak."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    setAccountId(accounts.length === 1 ? accounts[0].account_id : "");
    setName("");
    setPhoneNumber("");
    setEmail("");
    setNotes("");
    setFormError(null);
    openModal();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError("Anda harus login terlebih dahulu.");
      return;
    }
    if (!accountId) {
      setFormError("Pilih account WhatsApp terlebih dahulu.");
      return;
    }
    if (!name.trim()) {
      setFormError("Nama kontak wajib diisi.");
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError("Nomor HP wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await createContact({
        account_id: accountId,
        user_id: user.id,
        name: name.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      closeModal();
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal membuat kontak.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (contact: CoreContact) => {
    const confirmed = window.confirm(
      `Hapus kontak "${contact.name}"? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    try {
      await deleteContact(contact.contact_id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kontak.");
    }
  };

  return (
    <div>
      <PageMeta title="Contact Saya | Zaplio" description="Kelola kontak Anda" />
      <PageBreadcrumb pageTitle="Contact Saya" />

      <div className="space-y-6">
        <ComponentCard
          title="Daftar Kontak"
          desc="Kelola kontak pribadi Anda (tambah / hapus)."
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {contacts.length} kontak
            </span>
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              + Tambah Kontak
            </button>
          </div>

          {error && (
            <p className="mb-4 text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={thClass}>
                    Nama
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Nomor HP
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Account
                  </TableCell>
                  <TableCell isHeader className={thClass}>
                    Email
                  </TableCell>
                  <TableCell isHeader className={thClass}>
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
                ) : contacts.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                      Belum ada kontak. Klik "Tambah Kontak" untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((c) => (
                    <TableRow key={c.contact_id}>
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {c.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {c.phone_number}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {accountNameById[c.account_id] ?? c.account_id}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {c.email ?? "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(c)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition"
                        >
                          Hapus
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>

      {/* Modal: Tambah Kontak */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-8 mx-4">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
          Tambah Kontak
        </h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <Label>
              Account WhatsApp <span className="text-error-500">*</span>
            </Label>
            <AccountSelect
              accounts={accounts}
              value={accountId}
              onChange={setAccountId}
              disabled={submitting}
              placeholder="Pilih account"
            />
          </div>
          <div>
            <Label>
              Nama <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="contoh: Budi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <Label>
              Nomor HP <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="contoh: 628123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <Label>Email (opsional)</Label>
            <Input
              type="email"
              placeholder="contoh: budi@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <Label>Catatan (opsional)</Label>
            <Input
              placeholder="catatan singkat"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          {formError && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {formError}
            </p>
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
