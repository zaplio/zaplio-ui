import PlaceholderPage from "../../components/common/PlaceholderPage";

export default function Campaigns() {
  return (
    <PlaceholderPage
      pageTitle="Campaigns (Blast)"
      phase="Fase 1 — Inti blast"
      description="Buat dan pantau campaign blast WhatsApp dengan kontrol anti-ban."
      features={[
        "List campaign: status, progress (sent/total), delivered%, aksi",
        "Builder 4 langkah: Audience → Message → Sending → Review",
        "Anti-ban: rotasi akun, delay acak, batas/jam, jeda batch",
        "Jadwal kirim sekarang atau terjadwal, progress real-time",
      ]}
    />
  );
}
