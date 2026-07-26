import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { SupportRequestsDataTable } from "@/components/admin/support-requests-data-table";
import type {
  SupportRequestStatus,
  SupportRequestType,
} from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_TYPE_LABELS,
} from "@/lib/support-labels";
import { listSupportRequestsForAdmin } from "@/services/support";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destek",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_VALUES = Object.keys(
  SUPPORT_STATUS_LABELS,
) as SupportRequestStatus[];
const TYPE_VALUES = Object.keys(SUPPORT_TYPE_LABELS) as SupportRequestType[];

export default async function AdminSupportPage({ searchParams }: PageProps) {
  await requireAdminPermission("support.manage");
  const a = getMessages().admin;
  const params = await searchParams;
  const query = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q") ?? "";
  const statusRaw = getSearchParam(params, "status") ?? "";
  const typeRaw = getSearchParam(params, "type") ?? "";
  const status =
    statusRaw && STATUS_VALUES.includes(statusRaw as SupportRequestStatus)
      ? (statusRaw as SupportRequestStatus)
      : "all";
  const type =
    typeRaw && TYPE_VALUES.includes(typeRaw as SupportRequestType)
      ? (typeRaw as SupportRequestType)
      : "all";

  const result = await listSupportRequestsForAdmin({
    page: query.page,
    pageSize: query.pageSize,
    status,
    type,
    q,
  });

  return (
    <div>
      <AdminPageHeader
        title={a.support}
        description={a.supportDescription}
      />

      <SupportRequestsDataTable
        rows={result.rows.map((row) => ({
          id: row.id,
          trackingNo: row.trackingNo,
          typeLabel: row.typeLabel,
          applicantName: row.applicantName,
          applicantEmail: row.applicantEmail,
          subject: row.subject,
          statusLabel: row.statusLabel,
          messageCount: row.messageCount,
          dueLabel: row.dueAt ? formatDate(row.dueAt) : "—",
          createdLabel: formatDateTime(row.createdAt),
        }))}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        query={{
          q,
          status: status === "all" ? "" : status,
          type: type === "all" ? "" : type,
        }}
        labels={{
          search: a.supportSearch,
          all: a.filterAll,
          empty: a.supportEmpty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          trackingNo: a.applicationTrackingNo,
          type: a.supportFilterType,
          applicant: a.supportApplicant,
          subject: "Konu",
          status: a.supportFilterStatus,
          dueAt: a.supportDueAt,
          createdAt: "Tarih",
          messages: "{n} mesaj",
        }}
        statusOptions={STATUS_VALUES.map((value) => ({
          value,
          label: SUPPORT_STATUS_LABELS[value],
        }))}
        typeOptions={TYPE_VALUES.map((value) => ({
          value,
          label: SUPPORT_TYPE_LABELS[value],
        }))}
      />
    </div>
  );
}
