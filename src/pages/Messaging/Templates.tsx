import PlaceholderPage from "../../components/common/PlaceholderPage";

export default function Templates() {
  return (
    <PlaceholderPage
      pageTitle="Templates"
      phase="Fase 1 — Inti blast"
      description="Buat dan kelola template pesan dengan variabel personalisasi, media, dan spintax."
      features={[
        "Editor body dengan chip variabel {{nama}}, {{kota}}",
        "Spintax untuk variasi teks (anti pattern-detection)",
        "Lampiran media: gambar / video / dokumen + caption",
        "Preview bubble WhatsApp & test-send",
      ]}
    />
  );
}
