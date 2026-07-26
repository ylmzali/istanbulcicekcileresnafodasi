"use client";

import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type ContactSubmissionTableRow = {
  id: string;
  subject: string;
  name: string;
  email: string;
  phone: string;
  messagePreview: string;
  statusLabel: string;
  createdLabel: string;
};

type ContactSubmissionsDataTableProps = {
  rows: ContactSubmissionTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; status?: string };
  labels: DataTableLabels & {
    subject: string;
    applicant: string;
    phone: string;
    message: string;
    status: string;
    createdAt: string;
  };
  statusOptions: Array<{ value: string; label: string }>;
};

export function ContactSubmissionsDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  statusOptions,
}: ContactSubmissionsDataTableProps) {
  const columns: DataTableColumn<ContactSubmissionTableRow>[] = [
    {
      id: "subject",
      header: labels.subject,
      cell: (row) => (
        <div>
          <div className="font-medium text-[var(--color-text)]">
            {row.subject}
          </div>
          <div className="mt-0.5 line-clamp-2 max-w-[280px] text-xs text-[var(--color-text-muted)]">
            {row.messagePreview}
          </div>
        </div>
      ),
    },
    {
      id: "applicant",
      header: labels.applicant,
      cell: (row) => (
        <div>
          <div className="font-medium text-[var(--color-text)]">{row.name}</div>
          <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {row.email}
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: labels.phone,
      className: "whitespace-nowrap text-[var(--color-text-muted)]",
      cell: (row) => row.phone,
    },
    {
      id: "status",
      header: labels.status,
      cell: (row) => <StatusBadge label={row.statusLabel} />,
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
      labels={labels}
      basePath={routes.admin.contactSubmissions}
      total={total}
      page={page}
      pageSize={pageSize}
      query={{
        q: query.q ?? "",
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
