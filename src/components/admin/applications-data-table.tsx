"use client";

import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type ApplicationTableRow = {
  id: string;
  trackingNo: string;
  applicantName: string;
  email: string;
  businessName: string;
  districtName: string;
  statusLabel: string;
  documentCount: number;
  createdLabel: string;
};

type ApplicationsDataTableProps = {
  rows: ApplicationTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; status?: string };
  labels: DataTableLabels & {
    trackingNo: string;
    applicant: string;
    business: string;
    district: string;
    status: string;
    documents: string;
    createdAt: string;
  };
  statusOptions: Array<{ value: string; label: string }>;
};

export function ApplicationsDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  statusOptions,
}: ApplicationsDataTableProps) {
  const columns: DataTableColumn<ApplicationTableRow>[] = [
    {
      id: "trackingNo",
      header: labels.trackingNo,
      className:
        "whitespace-nowrap font-medium text-[var(--color-primary-800)]",
      cell: (row) => row.trackingNo,
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
            {row.email}
          </div>
        </div>
      ),
    },
    {
      id: "business",
      header: labels.business,
      cell: (row) => row.businessName,
    },
    {
      id: "district",
      header: labels.district,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.districtName,
    },
    {
      id: "status",
      header: labels.status,
      cell: (row) => <StatusBadge label={row.statusLabel} />,
    },
    {
      id: "documents",
      header: labels.documents,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => String(row.documentCount),
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
      getRowHref={(row) => routes.admin.applicationDetail(row.id)}
      labels={labels}
      basePath={routes.admin.applications}
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
