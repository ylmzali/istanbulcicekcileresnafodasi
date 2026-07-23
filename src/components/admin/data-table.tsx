import Link from "next/link";
import { AutoSubmitSelect } from "@/components/admin/auto-submit-select";
import { buildAdminTableHref } from "@/lib/admin-table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableFilter = {
  id: string;
  label: string;
  type: "search" | "select";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  value?: string;
};

export type DataTableLabels = {
  search: string;
  all: string;
  empty: string;
  results: string;
  prev: string;
  next: string;
  apply?: string;
};

type AdminDataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  filters?: DataTableFilter[];
  getRowId: (row: T) => string;
  labels: DataTableLabels;
  basePath: string;
  total: number;
  page: number;
  pageSize: number;
  /** Current query values preserved in pagination links (excluding page). */
  query: Record<string, string>;
  toolbarEnd?: React.ReactNode;
};

export function AdminDataTable<T>({
  rows,
  columns,
  filters = [],
  getRowId,
  labels,
  basePath,
  total,
  page,
  pageSize,
  query,
  toolbarEnd,
}: AdminDataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const prevHref = buildAdminTableHref(basePath, {
    ...query,
    page: currentPage - 1,
    pageSize,
  });
  const nextHref = buildAdminTableHref(basePath, {
    ...query,
    page: currentPage + 1,
    pageSize,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <form
        method="get"
        action={basePath}
        className="flex flex-col gap-3 border-b border-[var(--color-border)] px-3 py-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex flex-1 flex-wrap items-end gap-2">
          {filters.map((filter) => {
            if (filter.type === "search") {
              return (
                <label
                  key={filter.id}
                  className="min-w-[180px] flex-1 space-y-1 sm:max-w-xs"
                >
                  <span className="block text-xs font-medium text-[var(--color-text-muted)]">
                    {filter.label}
                  </span>
                  <input
                    type="search"
                    name={filter.id}
                    defaultValue={filter.value ?? ""}
                    placeholder={filter.placeholder ?? labels.search}
                    className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm outline-none focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
                  />
                </label>
              );
            }

            return (
              <AutoSubmitSelect
                key={filter.id}
                name={filter.id}
                label={filter.label}
                defaultValue={filter.value ?? ""}
                allLabel={labels.all}
                options={filter.options ?? []}
              />
            );
          })}
          <button
            type="submit"
            className="h-9 rounded-lg bg-[var(--color-primary-800)] px-3 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
          >
            {labels.apply ?? labels.search}
          </button>
        </div>

        <div className="flex items-center gap-3 self-end">
          <p className="text-xs text-[var(--color-text-muted)]">
            {labels.results.replace("{total}", String(total))}
          </p>
          {toolbarEnd}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-text-muted)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "px-3 py-2.5 text-xs font-medium",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]"
                >
                  {labels.empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-soft)]/70"
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn("px-3 py-2.5 align-middle", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize ? (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-3 py-2.5">
          <p className="text-xs text-[var(--color-text-muted)]">
            {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage <= 1 ? (
              <span className="inline-flex h-8 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium opacity-40">
                {labels.prev}
              </span>
            ) : (
              <Link
                href={prevHref}
                className="inline-flex h-8 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium hover:bg-[var(--color-surface-soft)]"
              >
                {labels.prev}
              </Link>
            )}
            {currentPage >= totalPages ? (
              <span className="inline-flex h-8 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium opacity-40">
                {labels.next}
              </span>
            ) : (
              <Link
                href={nextHref}
                className="inline-flex h-8 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium hover:bg-[var(--color-surface-soft)]"
              >
                {labels.next}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
