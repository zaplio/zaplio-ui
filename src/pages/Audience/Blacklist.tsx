import PlaceholderPage from "../../components/common/PlaceholderPage";

export default function Blacklist() {
  return (
    <PlaceholderPage
      pageTitle="Blacklist / Opt-out"
      phase="Fase 2 — Audience"
      description="Daftar nomor yang opt-out atau diblokir. Campaign otomatis melewati nomor di sini (wajib, anti spam-report)."
      features={[
        "Otomatis dari balasan 'STOP/BERHENTI'",
        "Tambah/hapus nomor secara manual",
        "Campaign skip nomor blacklist secara default",
        "Import & export daftar opt-out",
      ]}
    />
  );
}
