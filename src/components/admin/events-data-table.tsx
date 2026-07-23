import Link from "next/link";
import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

export type EventTableRow = {
  id: string;
  title: string;
  startsAtLabel: string;
  registrations: number;
  status: string;
  statusLabel: string;
};

type EventsDataTableProps = {
  rows: EventTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; status?: string };
  labels: DataTableLabels & {
    title: string;
    startsAt: string;
    status: string;
    edit: string;
    registrations: string;
  };
  statusOptions: Array<{ value: string; label: string }>;
};

export function EventsDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  statusOptions,
}: EventsDataTableProps) {
  const columns: DataTableColumn<EventTableRow>[] = [
    {
      id: "title",
      header: labels.title,
      cell: (row) => (
        <div>
          <div className="font-medium text-[var(--color-text)]">{row.title}</div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {row.registrations} {labels.registrations}
          </div>
        </div>
      ),
    },
    {
      id: "startsAt",
      header: labels.startsAt,
      className: "whitespace-nowrap text-[var(--color-text-muted)]",
      cell: (row) => row.startsAtLabel,
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
          href={routes.admin.eventEdit(row.id)}
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
      basePath={routes.admin.events}
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
