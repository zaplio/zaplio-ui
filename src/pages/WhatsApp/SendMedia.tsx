import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function SendMedia() {
  return (
    <>
      <PageMeta title="Send Media Message | Zaplio" description="Send media messages via WhatsApp" />
      <PageBreadcrumb pageTitle="Media Message" />
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 bg-white rounded-2xl dark:bg-gray-900 dark:border-gray-800 border border-gray-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Send Media Message
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Media message form — coming soon.
          </p>
        </div>
      </div>
    </>
  );
}
