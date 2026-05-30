# zaplio-ui — Context

Frontend Zaplio. Berbasis **TailAdmin React (Free) v2.0.2** — template admin dashboard. Template ini dijadikan kerangka halaman (layout, komponen, design system) untuk membangun UI Zaplio yang terhubung ke backend (`authcenterapi`, `whatsapp-api`, `qrstreamer`). Lihat `../docs/API_DOCUMENTATION.md` untuk kontrak API.

## Stack
- React 19 + TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- Vite 6 (`npm run dev` / `build` / `lint` / `preview`)
- Tailwind CSS v4 (config via `@theme` di `src/index.css`, bukan tailwind.config.js)
- Routing: `react-router` v7 (import dari `"react-router"`, BUKAN `react-router-dom`)
- Charts: ApexCharts (`react-apexcharts`) · Calendar: FullCalendar · Maps: `@react-jvectormap`
- Lain: `flatpickr` (date), `swiper`, `react-dnd`, `react-dropzone`, `react-helmet-async` (meta), `clsx`, `tailwind-merge`
- Node 18+ (disarankan 20+). Saat `npm install` gunakan `--legacy-peer-deps` bila ada konflik peer deps.

## Struktur folder (`src/`)
- `main.tsx` — entry. Bungkus app: `ThemeProvider` → `AppWrapper` (HelmetProvider) → `App`. Import CSS global di sini.
- `App.tsx` — definisi semua route. Route di dalam `<AppLayout/>` = halaman dengan sidebar+header; route auth (`/signin`, `/signup`) & `*` (NotFound) di luar layout.
- `layout/` — `AppLayout` (shell: sidebar + header + `<Outlet/>`), `AppSidebar`, `AppHeader`, `Backdrop`, `SidebarWidget`.
- `context/` — `ThemeContext` (light/dark, simpan ke `localStorage`, toggle class `dark` di `<html>`), `SidebarContext` (expand/hover/mobile).
- `components/` — UI reusable, dikelompokkan: `ui/` (button, badge, modal, table, alert, avatar, dropdown…), `form/` (Input, Label, Select, Checkbox, Radio, TextArea, date-picker, PhoneInput, MultiSelect…), `common/` (PageMeta, PageBreadCrumb, ComponentCard, ThemeToggleButton…), `charts/`, `tables/`, `ecommerce/`, `header/`, `auth/`, `UserProfile/`.
- `pages/` — halaman per route: `Dashboard/Home`, `AuthPages/` (SignIn, SignUp, AuthPageLayout), `Forms/`, `Tables/`, `Charts/`, `UiElements/`, `OtherPage/NotFound`, `UserProfiles`, `Calendar`, `Blank`.
- `icons/index.ts` — ~56 ikon SVG-as-React (via `vite-plugin-svgr`), di-import named: `import { GridIcon, UserCircleIcon } from "../icons"`.
- `hooks/` — `useModal`, `useGoBack`. `svg.d.ts`/`vite-env.d.ts` — type decls.

## Konvensi (ikuti pola yang ada)
- **Tidak ada path alias** (`@/`). Pakai import relatif (`../../components/...`).
- Komponen = function component + `export default`. Props via `interface`, file `.tsx`.
- Styling pakai utility Tailwind inline + token kustom: warna `brand-*`, `error-*`, `success-*`, `warning-*`, `blue-light-*`; font `Outfit`; ukuran teks `text-title-*` / `text-theme-*`; breakpoint custom (`2xsm`,`xsm`,`3xl`). Semua didefinisikan di `src/index.css` (`@theme`).
- **Dark mode**: selalu sediakan varian `dark:` (mis. `bg-white dark:bg-gray-900`). Aktif via class `.dark` di root.
- **Meta per halaman**: bungkus dengan `<PageMeta title description />` (react-helmet-async). Halaman dalam layout biasanya pakai `<PageBreadcrumb pageTitle="..."/>` di atas konten.
- **Card section**: `ComponentCard` (title/desc/children) untuk bungkus demo/section.
- Form pakai komponen di `components/form/` (`Input` punya prop `error/success/hint/disabled`; `Label`; `Button` punya `variant: primary|outline`, `size: sm|md`, `startIcon/endIcon`).

## Menambah halaman/menu baru
1. Buat page di `src/pages/<Area>/Nama.tsx` (pakai `PageMeta` + `PageBreadcrumb`).
2. Daftarkan route di `src/App.tsx` (di dalam `<Route element={<AppLayout/>}>` agar dapat sidebar+header, dan di dalam `<ProtectedRoute>` agar butuh login).
3. Tambah entri navigasi di `src/layout/AppSidebar.tsx` (`navItems`; item bisa punya `path` untuk link langsung atau `subItems` untuk dropdown).

## Navigasi aktif (sidebar) — section-based (acuan docs/FRONTEND_DESIGN.md)
`AppSidebar.tsx` kini pakai `menuGroups: {label, items}[]` (section header), item = link langsung (`path`). Refactor: `openSubmenu` keyed by `{group,index}`. Section aktif:
1. **Main** → Dashboard `/`.
2. **WhatsApp Accounts** → Kelola Account `/wa/accounts`, Scan / Pairing QR `/wa/scan-qr`.
3. **Messaging** → Templates `/templates` 🔴, Campaigns `/campaigns` 🔴, Scheduled `/scheduled` 🔴, Quick Send `/wa/send-message`.
4. **Audience** → Contacts `/wa/my-contacts` (=MyContacts, core-manager-api), **Segments & Tags `/segments` 🟢** (fungsional), Blacklist `/blacklist` 🔴, Whatsapp Contact `/wa/contacts`, Groups (WA) `/wa/groups`.

🔴 = halaman placeholder (`components/common/PlaceholderPage.tsx`, "Segera hadir" + daftar rencana fitur) karena backend belum ada. Halaman lain (Account Health, Inbox, Reports, Settings, dst di FRONTEND_DESIGN.md) belum dibuat.

**Segments & Tags** (`/segments`, `pages/Audience/Segments.tsx`): kelola Tags (CRUD + warna) & Segments (CRUD + rules builder + live count via `previewSegment`). Service `src/services/tag.ts` & `src/services/segment.ts` → core-manager-api (`/api/v1/tags`, `/api/v1/segments`, `/api/v1/contacts/:id/tags`). conditions = `{match:"all"|"any", rules:[{field,operator,value}]}`.

## Backend yang dipakai frontend
- authcenterapi (`VITE_AUTH_API_URL`, :8080), whatsapp-api (`VITE_WHATSAPP_API_URL`, :8001), qrstreamer (`VITE_QRSTREAMER_WS_URL`, :8002), **core-manager-api** (`VITE_CORE_API_URL`, :8003) untuk CRUD WhatsApp account & contact.
- `src/services/account.ts` (listAccounts/createAccount/deleteAccount) → core-manager-api → halaman `Accounts.tsx` (Kelola Account).
- `src/services/contact.ts` (listContacts/createContact/deleteContact) → core-manager-api → halaman `MyContacts.tsx` ("Contact Saya": tabel + modal create dgn dropdown akun + delete; difilter client-side by user_id).
- `src/services/whatsapp.ts` (getContacts/getGroups) → whatsapp-api → halaman `Contacts.tsx` ("Whatsapp Contact") & `Groups.tsx`.
- **Pilih account via dropdown**: `QrConnect.tsx` & `SendMessage.tsx` pakai `<select>` akun (dari `listAccounts`), nilai = `account_id`. Pre-select via query param `?account_id=` — tombol "Scan QR"/"Kirim Pesan" di `Accounts.tsx` membawa `account_id` lewat `useSearchParams`.

`othersItems` dikosongkan & blok "Others" dihapus dari render.

## `src/_reference/` — halaman demo template (di-hide)
Semua halaman demo TailAdmin (Calendar, UserProfiles, Blank, Forms/FormElements, Tables/BasicTables, UiElements/*, Charts/*) dipindah ke `src/_reference/` — **tidak di-route & tidak di-menu**, disimpan sebagai contoh untuk dicontek. Struktur subfolder dipertahankan agar import relatif tetap valid; tinggal copy balik ke `src/pages/` + daftarkan route+menu untuk mengaktifkan. Lihat `src/_reference/README.md`. (Komponen reusable di `src/components/*` TETAP di tempatnya — dipakai halaman aktif & referensi.)

## Integrasi backend (SUDAH dikerjakan)
Layer integrasi & fitur WhatsApp sudah tersambung ke backend:
- **Config**: `.env` (`VITE_AUTH_API_URL`, `VITE_WHATSAPP_API_URL`, `VITE_QRSTREAMER_WS_URL`) dibaca di `src/services/config.ts` (ada fallback localhost).
- **Services** (`src/services/`): `types.ts` (tipe API), `auth.ts` (login/register/getProfile/logout + parse envelope authcenterapi), `whatsapp.ts` (sendMessage/getContacts/getGroups — whatsapp-api tanpa envelope).
- **Auth state**: `src/context/AuthContext.tsx` (`useAuth`) — login/register/logout, simpan session ke `localStorage` key `zaplio.auth` (lewat `TOKEN_STORAGE_KEY`). Provider dipasang di `main.tsx` (membungkus AppWrapper).
- **Route guard**: `src/components/auth/ProtectedRoute.tsx` — semua route dashboard dibungkus `<ProtectedRoute>` di `App.tsx`; redirect ke `/signin` bila belum login.
- **Auth UI**: `SignInForm` (pakai field **username**+password → `useAuth().login`), `SignUpForm` (username/email/phone/password → `register`). `UserDropdown` menampilkan user nyata + tombol Sign out (panggil `logout`).
- **QR pairing**: `src/hooks/useQrStream.ts` (kelola WebSocket qrstreamer; expose status/qr/event/error + connect/disconnect). Halaman `src/pages/WhatsApp/QrConnect.tsx` render QR via lib **`react-qr-code`** (QR string mentah dari pesan `qr_code`). `user_id` otomatis dari user login; `wa_id` diinput.
- **WhatsApp pages** (`src/pages/WhatsApp/`): `SendMessage.tsx` (kirim text via `/api/v1/messages`), `Contacts.tsx` & `Groups.tsx` (input account/device ID → tabel).
- **Menu sidebar**: grup "WhatsApp" (ChatIcon) di `AppSidebar.tsx` → Scan QR `/wa/scan-qr`, Send Message `/wa/send-message`, List Contact `/wa/contacts`, List Group `/wa/groups`.

Dependency baru: `react-qr-code`. Build & `tsc -b` lulus.

## Rebranding ke Zaplio (SUDAH dikerjakan)
- Semua teks "TailAdmin / React.js Admin Dashboard Template" di PageMeta (judul+deskripsi semua halaman) → "Zaplio". `index.html` punya `<title>Zaplio</title>`.
- `SidebarWidget` → konten Zaplio (CTA "Hubungkan WhatsApp" ke /wa/scan-qr).
- `AuthPageLayout` → heading "Zaplio" + tagline platform WhatsApp.
- Auth pages: tombol social login hanya **Sign in/up with Google** (tombol "Sign in/up with X" DIHAPUS, grid jadi 1 kolom). Subtitle form di-Indonesia-kan.
- Footer NotFound `© <year> - Zaplio`.
- **Logo Zaplio** dibuat sendiri (SVG): ikon kotak rounded gradient brand + petir "zap" putih. File di `public/images/logo/` (`logo.svg` light, `logo-dark.svg`, `logo-icon.svg` collapsed, `auth-logo.svg`) + `public/favicon.svg` (index.html menunjuk ke sini). Wordmark "Zaplio" pakai `<text>` font Outfit dengan fallback system-ui (webfont tidak load di SVG via `<img>`, jadi tampil bold system-ui — ikon tetap vektor sempurna). `alt` semua logo = "Zaplio".

## Status & catatan
- Repo git terpisah, remote = TailAdmin upstream (`github.com/TailAdmin/free-react-tailwind-admin-dashboard`), branch `main`.
- **Belum**: Tombol "Sign in with Google" masih statis (belum panggil OAuth `/api/v1/auth/google`). Halaman `/profile` (UserProfiles) sudah dipindah ke `src/_reference` (di-hide). `favicon.png` lama masih ada di `public/` tapi tidak dipakai (index.html → `favicon.svg`).
- Ini versi **Free**: 1 dashboard (Ecommerce), komponen dasar. Fitur Pro tidak ada.
- SendMessage baru mendukung **type text**; media (image/video/document/audio/location) belum ada form-nya (tipe sudah didefinisikan di `services/types.ts`).
- **Refresh token belum otomatis**: session disimpan tapi belum ada interceptor untuk refresh `access_token` saat expired (endpoint `/api/v1/auth/refresh` tersedia). Login Google/X masih tombol statis.
- whatsapp-api `contacts`/`groups` mengembalikan `null` bila kosong — UI sudah handle (fallback `[]`).
