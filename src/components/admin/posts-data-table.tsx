import Link from "next/link";
import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type PostTableRow = {
  id: string;
  title: string;
  slug: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
};

type PostsDataTableProps = {
  rows: PostTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; type?: string; status?: string };
  labels: DataTableLabels & {
    title: string;
    type: string;
    status: string;
    edit: string;
  };
  typeOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
};

export function PostsDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  typeOptions,
  statusOptions,
}: PostsDataTableProps) {
  const columns: DataTableColumn<PostTableRow>[] = [
    {
      id: "title",
      header: labels.title,
      cell: (row) => (
        <div>
          <div className="font-medium text-[var(--color-text)]">{row.title}</div>
          <div className="text-xs text-[var(--color-text-muted)]">{row.slug}</div>
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
          href={routes.admin.postEdit(row.id)}
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
      basePath={routes.admin.posts}
      total={total}
      page={page}
      pageSize={pageSize}
      query={{
        q: query.q ?? "",
        type: query.type ?? "",
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
          id: "type",
          label: labels.type,
          type: "select",
          options: typeOptions,
          value: query.type,
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
