# _reference — Halaman Demo Template (TidakAktif)

Folder ini berisi halaman demo bawaan template TailAdmin yang **di-hide dari navigasi & routing** Zaplio, disimpan sebagai contoh/referensi untuk "nyontek" pola UI saat membangun halaman baru.

Isi:
- `Calendar.tsx` — contoh FullCalendar
- `UserProfiles.tsx` — contoh halaman profil (komponen di `components/UserProfile/`)
- `Blank.tsx` — halaman kosong / starter
- `Forms/FormElements.tsx` — contoh semua elemen form
- `Tables/BasicTables.tsx` — contoh tabel
- `UiElements/*` — Alerts, Avatars, Badges, Buttons, Images, Videos
- `Charts/*` — LineChart, BarChart (ApexCharts)

## Catatan
- File-file ini **tidak di-import** di `App.tsx` sehingga tidak ikut dibundle Vite (tree-shaking), tapi tetap ikut type-check `tsc`.
- Struktur subfolder sengaja dipertahankan sama seperti di `src/pages/` agar path import relatif (`../components`, `../../components`) tetap valid — bisa langsung di-copy kembali ke `src/pages/`.
- Untuk mengaktifkan ulang sebuah halaman: pindahkan/copy ke `src/pages/`, import di `src/App.tsx`, daftarkan `<Route>`-nya, dan tambahkan entri menu di `src/layout/AppSidebar.tsx`.
