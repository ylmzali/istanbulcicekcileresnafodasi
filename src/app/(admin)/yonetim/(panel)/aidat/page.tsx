import type { Metadata } from "next";
import Link from "next/link";
import { DuesDataTable } from "@/components/admin/dues-data-table";
import {
  AdminFormCard,
  AdminPageHeader,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import type { DueStatus } from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { formatDate } from "@/lib/datetime";
import { formatMoney } from "@/lib/money";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import {
  dueStatusSchema,
  getDuesSummary,
  listDuesPeriods,
  listMemberDues,
} from "@/services/dues";

export const metadata: Metadata = {
  title: "Aidat",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDuesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q");
  const periodId = getSearchParam(params, "periodId");
  const statusRaw = getSearchParam(params, "status");
  const status = dueStatusSchema.safeParse(statusRaw).success
    ? (statusRaw as DueStatus)
    : undefined;

  const [summary, periods, dues] = await Promise.all([
    getDuesSummary(),
    listDuesPeriods(),
    listMemberDues({
      q: q || undefined,
      periodId: periodId || undefined,
      status,
      page: tableQuery.page,
      pageSize: tableQuery.pageSize,
    }),
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={a.dues}
        description={a.duesDescription}
        actions={
          <Link href={routes.admin.duesPeriodNew}>
            <Button size="sm">{a.duesPeriodNew}</Button>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label={a.duesSummaryOpen} value={summary.openAmountLabel} />
        <SummaryCard
          label={a.duesSummaryUnpaid}
          value={String(summary.unpaid)}
        />
        <SummaryCard
          label={a.duesSummaryOverdue}
          value={String(summary.overdue)}
        />
        <SummaryCard label={a.duesSummaryPaid} value={String(summary.paid)} />
      </div>

      <AdminFormCard className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {a.duesPeriods}
          </h2>
          <Link
            href={routes.admin.duesPeriodNew}
            className="text-sm font-medium text-[var(--color-primary-800)] hover:underline"
          >
            {a.duesPeriodNew}
          </Link>
        </div>

        {periods.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {a.duesEmptyPeriods}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {periods.map((period) => (
              <li
                key={period.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={routes.admin.duesPeriodEdit(period.id)}
                    className="font-medium text-[var(--color-primary-800)] hover:underline"
                  >
                    {period.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {period.year} · {formatMoney(period.amount)} ·{" "}
                    {a.duesPeriodDueDate}: {formatDate(period.dueDate)} ·{" "}
                    {period._count.memberDues} kayıt
                    {period.active ? "" : " · Pasif"}
                  </p>
                </div>
                <Link
                  href={`${routes.admin.dues}?periodId=${period.id}`}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-800)]"
                >
                  {a.duesRecords}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminFormCard>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {a.duesRecords}
        </h2>
        <DuesDataTable
          rows={dues.rows.map((row) => ({
            id: row.id,
            memberName: row.memberName,
            memberNo: row.member.memberNo,
            periodTitle: row.period.title,
            assessedLabel: row.assessedAmountLabel,
            paidLabel: row.paidAmountLabel,
            remainingLabel: row.remainingAmountLabel,
            status: row.status,
            statusLabel: a.duesStatuses[row.status],
          }))}
          total={dues.total}
          page={dues.page}
          pageSize={dues.pageSize}
          query={{ q, periodId, status: statusRaw }}
          labels={{
            search: a.search,
            all: a.filterAll,
            empty: a.empty,
            results: a.resultsCount,
            prev: a.prevPage,
            next: a.nextPage,
            apply: a.applyFilters,
            member: a.fullName,
            period: a.duesPeriods,
            assessed: a.duesAssessed,
            paid: a.duesPaid,
            remaining: a.duesRemaining,
            status: a.status,
            edit: a.edit,
          }}
          periodOptions={periods.map((period) => ({
            value: period.id,
            label: period.title,
          }))}
          statusOptions={Object.entries(a.duesStatuses).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <AdminFormCard className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="text-xl font-semibold text-[var(--color-text)]">{value}</p>
    </AdminFormCard>
  );
}
