"use client";

import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type SupportRequestTableRow = {
  id: string;
  trackingNo: string;
  typeLabel: string;
  applicantName: string;
  applicantEmail: string;
  subject: string;
  statusLabel: string;
  messageCount: number;
  dueLabel: string;
  createdLabel: string;
};

type SupportRequestsDataTableProps = {
  rows: SupportRequestTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; status?: string; type?: string };
  labels: DataTableLabels & {
    trackingNo: string;
    type: string;
    applicant: string;
    subject: string;
    status: string;
    dueAt: string;
    createdAt: string;
    messages: string;
  };
  statusOptions: Array<{ value: string; label: string }>;
  typeOptions: Array<{ value: string; label: string }>;
};

export function SupportRequestsDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  statusOptions,
  typeOptions,
}: SupportRequestsDataTableProps) {
  const columns: DataTableColumn<SupportRequestTableRow>[] = [
    {
      id: "trackingNo",
      header: labels.trackingNo,
      className:
        "whitespace-nowrap font-medium text-[var(--color-primary-800)]",
      cell: (row) => (
        <div>
          <div>{row.trackingNo}</div>
          <div className="mt-0.5 text-xs font-normal text-[var(--color-text-muted)]">
            {labels.messages.replace("{n}", String(row.messageCount))}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: labels.type,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.typeLabel,
    },
    {
      id: "applicant",
      header: labels.applicant,
      cell: (row) => (
        <div>
          <div className="font-medium text-[var(--color-text)]">
            {row.applicantName}
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {row.applicantEmail}
          </div>
        </div>
      ),
    },
    {
      id: "subject",
      header: labels.subject,
      cell: (row) => (
        <div className="max-w-[240px] truncate" title={row.subject}>
          {row.subject}
        </div>
      ),
    },
    {
      id: "status",
      header: labels.status,
      cell: (row) => <StatusBadge label={row.statusLabel} />,
    },
    {
      id: "dueAt",
      header: labels.dueAt,
      className: "whitespace-nowrap text-[var(--color-text-muted)]",
      cell: (row) => row.dueLabel,
    },
    {
      id: "createdAt",
      header: labels.createdAt,
      className: "whitespace-nowrap text-[var(--color-text-muted)]",
      cell: (row) => row.createdLabel,
    },
  ];

  return (
    <AdminDataTable
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      getRowHref={(row) => routes.admin.supportDetail(row.id)}
      labels={labels}
      basePath={routes.admin.support}
      total={total}
      page={page}
      pageSize={pageSize}
      query={{
        q: query.q ?? "",
        status: query.status ?? "",
        type: query.type ?? "",
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
          id: "status",
          label: labels.status,
          type: "select",
          options: statusOptions,
          value: query.status,
        },
        {
          id: "type",
          label: labels.type,
          type: "select",
          options: typeOptions,
          value: query.type,
        },
      ]}
    />
  );
}
