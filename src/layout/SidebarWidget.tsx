export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-8 w-full max-w-52 rounded-xl bg-gray-50 px-3 py-4 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        Zaplio
      </h3>
      <p className="mb-3 text-gray-500 text-theme-xs dark:text-gray-400 leading-tight">
        Kelola akun & pesan WhatsApp Anda dalam satu dashboard.
      </p>
      <a
        href="/wa/scan-qr"
        className="flex items-center justify-center p-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
      >
        Hubungkan WhatsApp
      </a>
    </div>
  );
}
