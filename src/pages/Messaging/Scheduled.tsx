import PlaceholderPage from "../../components/common/PlaceholderPage";

export default function Scheduled() {
  return (
    <PlaceholderPage
      pageTitle="Scheduled"
      phase="Fase 1 — Inti blast"
      description="Kelola campaign yang dijadwalkan dalam tampilan kalender/list."
      features={[
        "Kalender & list campaign terjadwal (FullCalendar)",
        "Dukungan sekali jalan atau berulang (recurring)",
        "Timezone-aware (WIB/lokal)",
        "Edit atau batalkan jadwal",
      ]}
    />
  );
}
