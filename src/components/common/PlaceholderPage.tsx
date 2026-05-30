import PageMeta from "./PageMeta";
import PageBreadcrumb from "./PageBreadCrumb";

interface PlaceholderPageProps {
  pageTitle: string;
  description: string;
  features?: string[];
  phase?: string;
}

// Halaman placeholder untuk fitur yang belum ada backend-nya.
// Menampilkan ringkasan rencana fitur (acuan: docs/FRONTEND_DESIGN.md).
export default function PlaceholderPage({
  pageTitle,
  description,
  features = [],
  phase,
}: PlaceholderPageProps) {
  return (
    <div>
      <PageMeta title={`${pageTitle} | Zaplio`} description={description} />
      <PageBreadcrumb pageTitle={pageTitle} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-2xl py-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium rounded-full text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400">
            Segera hadir
            {phase && (
              <span className="text-gray-400 dark:text-gray-500">· {phase}</span>
            )}
          </span>

          <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
            {pageTitle}
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>

          {features.length > 0 && (
            <ul className="mx-auto max-w-md space-y-2 text-left">
              {features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  <span className="mt-0.5 text-brand-500">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
