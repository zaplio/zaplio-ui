import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import AccountSelect from "../../components/form/AccountSelect";
import { sendMessage } from "../../services/whatsapp";
import { listAccounts } from "../../services/account";
import { useAuth } from "../../context/AuthContext";
import type { WaAccount } from "../../services/types";

export default function SendMessage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<WaAccount[]>([]);
  const [accountId, setAccountId] = useState(searchParams.get("account_id") ?? "");
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccounts(user?.id)
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!accountId || !to || !text) {
      setError("Account ID, tujuan, dan pesan wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendMessage({
        account_id: accountId.trim(),
        to: to.trim(),
        type: "text",
        text,
      });
      setResult(`Pesan terkirim. Message ID: ${res.message.id}`);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Send Message | Zaplio"
        description="Kirim pesan WhatsApp"
      />
      <PageBreadcrumb pageTitle="Send Message" />

      <div className="max-w-2xl">
        <ComponentCard
          title="Kirim Pesan Teks"
          desc="Kirim pesan WhatsApp melalui device yang terhubung."
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm rounded-lg text-error-700 bg-error-50 border border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/30">
                {error}
              </div>
            )}
            {result && (
              <div className="p-3 text-sm rounded-lg text-success-700 bg-success-50 border border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/30">
                {result}
              </div>
            )}

            <div>
              <Label>WhatsApp Account</Label>
              <AccountSelect
                accounts={accounts}
                value={accountId}
                onChange={setAccountId}
                placeholder="Pilih account"
              />
            </div>
            <div>
              <Label>Tujuan (nomor / JID)</Label>
              <Input
                placeholder="contoh: 6281234567890"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Pesan</Label>
              <TextArea
                rows={5}
                placeholder="Tulis pesan..."
                value={text}
                onChange={(value) => setText(value)}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center px-5 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
