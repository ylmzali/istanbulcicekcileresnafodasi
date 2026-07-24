"use client";

import Link from "next/link";
import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type FaqTableRow = {
  id: string;
  question: string;
  categoryId: string;
  categoryLabel: string;
  status: string;
  statusLabel: string;
};

type FaqsDataTableProps = {
  rows: FaqTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; category?: string; status?: string };
  labels: DataTableLabels & {
    question: string;
    category: string;
    status: string;
    edit: string;
  };
  categoryOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
};

export function FaqsDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  categoryOptions,
  statusOptions,
}: FaqsDataTableProps) {
  const columns: DataTableColumn<FaqTableRow>[] = [
    {
      id: "question",
      header: labels.question,
      cell: (row) => (
        <div className="font-medium text-[var(--color-text)]">{row.question}</div>
      ),
    },
    {
      id: "category",
      header: labels.category,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.categoryLabel,
    },
    {
      id: "status",
      header: labels.status,
      cell: (row) => <StatusBadge label={row.statusLabel} />,
    },
    {
      id: "actions",
      header: "",
      headerClassName: "w-20",
      className: "text-right",
      cell: (row) => (
        <Link
          href={routes.admin.faqEdit(row.id)}
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
      labels={labels}
      basePath={routes.admin.faqs}
      total={total}
      page={page}
      pageSize={pageSize}
      query={{
        q: query.q ?? "",
        category: query.category ?? "",
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
          id: "category",
          label: labels.category,
          type: "select",
          options: categoryOptions,
          value: query.category,
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
