"use client";

import Link from "next/link";
import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type ResourceTableRow = {
  id: string;
  title: string;
  categoryLabel: string;
  versionLabel: string;
  visibility: string;
  visibilityLabel: string;
  sortOrder: number;
  publishedAtLabel: string;
};

type ResourcesDataTableProps = {
  rows: ResourceTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; visibility?: string };
  labels: DataTableLabels & {
    title: string;
    category: string;
    version: string;
    visibility: string;
    sortOrder: string;
    publishedAt: string;
    edit: string;
  };
  visibilityOptions: Array<{ value: string; label: string }>;
};

export function ResourcesDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  visibilityOptions,
}: ResourcesDataTableProps) {
  const columns: DataTableColumn<ResourceTableRow>[] = [
    {
      id: "title",
      header: labels.title,
      cell: (row) => (
        <div className="font-medium text-[var(--color-text)]">{row.title}</div>
      ),
    },
    {
      id: "category",
      header: labels.category,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.categoryLabel,
    },
    {
      id: "version",
      header: labels.version,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.versionLabel,
    },
    {
      id: "visibility",
      header: labels.visibility,
      cell: (row) => <StatusBadge label={row.visibilityLabel} />,
    },
    {
      id: "sortOrder",
      header: labels.sortOrder,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => String(row.sortOrder),
    },
    {
      id: "publishedAt",
      header: labels.publishedAt,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.publishedAtLabel || "—",
    },
    {
      id: "actions",
      header: "",
      headerClassName: "w-20",
      className: "text-right",
      cell: (row) => (
        <Link
          href={routes.admin.resourceEdit(row.id)}
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
      getRowHref={(row) => routes.admin.resourceEdit(row.id)}
      labels={labels}
      basePath={routes.admin.resources}
      total={total}
      page={page}
      pageSize={pageSize}
      query={{
        q: query.q ?? "",
        visibility: query.visibility ?? "",
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
          id: "visibility",
          label: labels.visibility,
          type: "select",
          options: visibilityOptions,
          value: query.visibility,
        },
      ]}
    />
  );
}
