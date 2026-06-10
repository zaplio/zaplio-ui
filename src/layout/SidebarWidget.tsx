export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-6 w-full max-w-52 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
        Zaplio
      </h3>
      <p className="mb-4 text-gray-500 text-theme-xs dark:text-gray-400 leading-normal">
        Kelola akun & pesan WhatsApp Anda dalam satu dashboard.
      </p>
      <a
        href="/wa/scan-qr"
        className="flex items-center justify-center p-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600"
      >
        Hubungkan WhatsApp
      </a>
    </div>
  );
}
