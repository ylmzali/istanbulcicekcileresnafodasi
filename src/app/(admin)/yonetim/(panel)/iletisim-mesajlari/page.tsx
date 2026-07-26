import type { Metadata } from "next";
import { ContactSubmissionsDataTable } from "@/components/admin/contact-submissions-data-table";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { formatDateTime } from "@/lib/datetime";
import { INPUT_FORMATS } from "@/lib/input-formats";
import { getMessages } from "@/lib/i18n";
import { listContactSubmissions } from "@/services/contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim Mesajları",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Yeni" },
  { value: "read", label: "Okundu" },
] as const;

function statusLabel(status: string) {
  if (status === "new") return "Yeni";
  if (status === "read") return "Okundu";
  return status;
}

export default async function ContactSubmissionsPage({
  searchParams,
}: PageProps) {
  const a = getMessages().admin;
  const params = await searchParams;
  const query = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q") ?? "";
  const statusRaw = getSearchParam(params, "status") ?? "";
  const status = STATUS_OPTIONS.some((item) => item.value === statusRaw)
    ? statusRaw
    : undefined;

  const result = await listContactSubmissions({
    page: query.page,
    pageSize: query.pageSize,
    status,
    q: q || undefined,
  });

  return (
    <div>
      <AdminPageHeader
        title={a.contactSubmissions}
        description="Site iletişim formundan gelen mesajlar."
      />

      <ContactSubmissionsDataTable
        rows={result.rows.map((row) => ({
          id: row.id,
          subject: row.subject || "Konusuz",
          name: row.name,
          email: row.email,
          phone: row.phone
            ? INPUT_FORMATS.phoneTr.format(row.phone)
            : "—",
          messagePreview: row.message,
          statusLabel: statusLabel(row.status),
          createdLabel: formatDateTime(row.createdAt),
        }))}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        query={{ q, status: status ?? "" }}
        labels={{
          search: a.search,
          all: a.filterAll,
          empty: a.empty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          subject: "Konu",
          applicant: "Gönderen",
          phone: "Telefon",
          message: "Mesaj",
          status: a.status,
          createdAt: "Tarih",
        }}
        statusOptions={STATUS_OPTIONS.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
      />
    </div>
  );
}
