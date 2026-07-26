import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { ApplicationsDataTable } from "@/components/admin/applications-data-table";
import type { ApplicationStatus } from "@/generated/prisma/client";
import { APPLICATION_STATUS_LABELS } from "@/lib/application-labels";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { listApplicationsForAdmin } from "@/services/applications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Başvurular",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_VALUES = Object.keys(
  APPLICATION_STATUS_LABELS,
) as ApplicationStatus[];

export default async function AdminApplicationsPage({
  searchParams,
}: PageProps) {
  await requireAdminPermission("applications.manage");
  const a = getMessages().admin;
  const params = await searchParams;
  const query = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q") ?? "";
  const statusRaw = getSearchParam(params, "status") ?? "";
  const status =
    statusRaw && STATUS_VALUES.includes(statusRaw as ApplicationStatus)
      ? (statusRaw as ApplicationStatus)
      : "all";

  const result = await listApplicationsForAdmin({
    page: query.page,
    pageSize: query.pageSize,
    status,
    q,
  });

  return (
    <div>
      <AdminPageHeader
        title={a.applications}
        description={a.applicationsDescription}
      />

      <ApplicationsDataTable
        rows={result.rows.map((row) => ({
          id: row.id,
          trackingNo: row.trackingNo,
          applicantName: row.applicantName,
          email: row.email,
          businessName: row.businessName,
          districtName: row.districtName,
          statusLabel: row.statusLabel,
          documentCount: row.documentCount,
          createdLabel: formatDateTime(row.submittedAt ?? row.createdAt),
        }))}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        query={{
          q,
          status: status === "all" ? "" : status,
        }}
        labels={{
          search: a.applicationsSearch,
          all: a.filterAll,
          empty: a.applicationsEmpty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          trackingNo: a.applicationTrackingNo,
          applicant: a.applicationApplicant,
          business: a.applicationBusiness,
          district: a.district,
          status: a.applicationsFilterStatus,
          documents: a.applicationDocuments,
          createdAt: "Tarih",
        }}
        statusOptions={STATUS_VALUES.map((value) => ({
          value,
          label: APPLICATION_STATUS_LABELS[value],
        }))}
      />
    </div>
  );
}
