"use client";

import Link from "next/link";
import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type DueTableRow = {
  id: string;
  memberName: string;
  memberNo: string;
  periodTitle: string;
  assessedLabel: string;
  paidLabel: string;
  remainingLabel: string;
  status: string;
  statusLabel: string;
};

type DuesDataTableProps = {
  rows: DueTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; periodId?: string; status?: string };
  labels: DataTableLabels & {
    member: string;
    period: string;
    assessed: string;
    paid: string;
    remaining: string;
    status: string;
    edit: string;
  };
  periodOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
};

export function DuesDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  periodOptions,
  statusOptions,
}: DuesDataTableProps) {
  const columns: DataTableColumn<DueTableRow>[] = [
    {
      id: "member",
      header: labels.member,
      cell: (row) => (
        <div>
          <div className="font-medium text-[var(--color-text)]">
            {row.memberName}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.memberNo}
          </div>
        </div>
      ),
    },
    {
      id: "period",
      header: labels.period,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.periodTitle,
    },
    {
      id: "assessed",
      header: labels.assessed,
      cell: (row) => row.assessedLabel,
    },
    {
      id: "paid",
      header: labels.paid,
      cell: (row) => row.paidLabel,
    },
    {
      id: "remaining",
      header: labels.remaining,
      cell: (row) => (
        <span className="font-medium text-[var(--color-text)]">
          {row.remainingLabel}
        </span>
      ),
    },
    {
      id: "status",
      header: labels.status,
      cell: (row) => <StatusBadge label={row.statusLabel} />,
    },
    {
      id: "actions",
      header: "",
      headerClassName: "w-24",
      className: "text-right",
      cell: (row) => (
        <Link
          href={routes.admin.duesDetail(row.id)}
          className="font-medium text-[var(--color-primary-800)] hover:underline"
        >
          {labels.edit}
        </Link>
      ),
    },
  ];

  return (
    <AdminDataTable
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      getRowHref={(row) => routes.admin.duesDetail(row.id)}
      labels={labels}
      basePath={routes.admin.dues}
      total={total}
      page={page}
      pageSize={pageSize}
      query={{
        q: query.q ?? "",
        periodId: query.periodId ?? "",
        status: query.status ?? "",
      }}
      filters={[
        {
          id: "q",
          label: labels.search,
          type: "search",
          placeholder: labels.search,
          value: query.q,
        },
        {
          id: "periodId",
          label: labels.period,
          type: "select",
          options: periodOptions,
          value: query.periodId,
        },
        {
          id: "status",
          label: labels.status,
          type: "select",
          options: statusOptions,
          value: query.status,
        },
      ]}
    />
  );
}
