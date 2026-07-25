import type { Metadata } from "next";
import Link from "next/link";
import { AutoSubmitSelect } from "@/components/admin/auto-submit-select";
import { AdminPageHeader, StatusBadge } from "@/components/admin/form-fields";
import type {
  SupportRequestStatus,
  SupportRequestType,
} from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
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
  const q = getSearchParam(params, "q");
  const statusRaw = getSearchParam(params, "status");
  const typeRaw = getSearchParam(params, "type");
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
    <div className="space-y-4">
      <AdminPageHeader
        title={a.support}
        description={`${a.supportDescription} Toplam ${result.total} kayıt.`}
      />

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <label className="space-y-1 text-xs font-medium text-[var(--color-text-muted)]">
          {a.supportSearch}
          <input
            name="q"
            defaultValue={q}
            className="block h-10 w-56 rounded-lg border border-[var(--color-border)] px-3 text-sm"
            placeholder="DST-…"
          />
        </label>
        <AutoSubmitSelect
          name="status"
          label={a.supportFilterStatus}
          defaultValue={status === "all" ? "" : status}
          allLabel={a.supportAllStatuses}
          options={STATUS_VALUES.map((value) => ({
            value,
            label: SUPPORT_STATUS_LABELS[value],
          }))}
        />
        <AutoSubmitSelect
          name="type"
          label={a.supportFilterType}
          defaultValue={type === "all" ? "" : type}
          allLabel={a.supportAllTypes}
          options={TYPE_VALUES.map((value) => ({
            value,
            label: SUPPORT_TYPE_LABELS[value],
          }))}
        />
        <button
          type="submit"
          className="h-10 rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-semibold text-white"
        >
          Filtrele
        </button>
      </form>

      {result.rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
          {a.supportEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Takip</th>
                <th className="px-4 py-3 font-semibold">Tür</th>
                <th className="px-4 py-3 font-semibold">Başvuran</th>
                <th className="px-4 py-3 font-semibold">Konu</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Hedef</th>
                <th className="px-4 py-3 font-semibold">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={routes.admin.supportDetail(row.id)}
                      className="font-semibold text-[var(--color-primary-800)] hover:underline"
                    >
                      {row.trackingNo}
                    </Link>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {row.messageCount} mesaj
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.typeLabel}</td>
                  <td className="px-4 py-3">
                    {row.applicantName}
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {row.applicantEmail}
                    </div>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3">
                    {row.subject}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={row.statusLabel} />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {row.dueAt ? formatDate(row.dueAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {formatDateTime(row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
