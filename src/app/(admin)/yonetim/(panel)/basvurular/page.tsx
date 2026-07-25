import type { Metadata } from "next";
import Link from "next/link";
import { AutoSubmitSelect } from "@/components/admin/auto-submit-select";
import { AdminPageHeader, StatusBadge } from "@/components/admin/form-fields";
import type { ApplicationStatus } from "@/generated/prisma/client";
import { APPLICATION_STATUS_LABELS } from "@/lib/application-labels";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
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
  const q = getSearchParam(params, "q");
  const statusRaw = getSearchParam(params, "status");
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
    <div className="space-y-4">
      <AdminPageHeader
        title={a.applications}
        description={`${a.applicationsDescription} Toplam ${result.total} kayıt.`}
      />

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <label className="space-y-1 text-xs font-medium text-[var(--color-text-muted)]">
          {a.applicationsSearch}
          <input
            name="q"
            defaultValue={q}
            className="block h-10 w-56 rounded-lg border border-[var(--color-border)] px-3 text-sm"
            placeholder="BA-…"
          />
        </label>
        <AutoSubmitSelect
          name="status"
          label={a.applicationsFilterStatus}
          defaultValue={status === "all" ? "" : status}
          allLabel={a.applicationsAllStatuses}
          options={STATUS_VALUES.map((value) => ({
            value,
            label: APPLICATION_STATUS_LABELS[value],
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
          {a.applicationsEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Takip</th>
                <th className="px-4 py-3 font-semibold">Başvuran</th>
                <th className="px-4 py-3 font-semibold">İşletme</th>
                <th className="px-4 py-3 font-semibold">İlçe</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Belge</th>
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
                      href={routes.admin.applicationDetail(row.id)}
                      className="font-semibold text-[var(--color-primary-800)] hover:underline"
                    >
                      {row.trackingNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text)]">
                    {row.applicantName}
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {row.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.businessName}</td>
                  <td className="px-4 py-3">{row.districtName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={row.statusLabel} />
                  </td>
                  <td className="px-4 py-3">{row.documentCount}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {formatDateTime(row.submittedAt ?? row.createdAt)}
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
