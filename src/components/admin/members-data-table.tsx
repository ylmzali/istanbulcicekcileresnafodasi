"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/form-fields";
import type { DataTableLabels } from "@/components/admin/data-table";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { AdminMemberTableRow } from "@/services/members";

type MembersDataTableProps = {
  initialQuery?: { q?: string; status?: string; page?: number; pageSize?: number };
  labels: DataTableLabels & {
    memberNo: string;
    fullName: string;
    businessName: string;
    district: string;
    phone: string;
    status: string;
    registeredAt: string;
    edit: string;
    loading: string;
    loadError: string;
  };
  statusOptions: Array<{ value: string; label: string }>;
};

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "a, button, input, label, select, textarea, [data-row-stop]",
    ),
  );
}

export function MembersDataTable({
  initialQuery,
  labels,
  statusOptions,
}: MembersDataTableProps) {
  const router = useRouter();
  const [qInput, setQInput] = useState(initialQuery?.q ?? "");
  const [q, setQ] = useState(initialQuery?.q ?? "");
  const [status, setStatus] = useState(initialQuery?.status ?? "");
  const [page, setPage] = useState(initialQuery?.page ?? 1);
  const [pageSize] = useState(initialQuery?.pageSize ?? 10);
  const [rows, setRows] = useState<AdminMemberTableRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestIdRef = useRef(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const fetchMembers = useCallback(
    async (params: { q: string; status: string; page: number }) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(false);

      const search = new URLSearchParams();
      if (params.q.trim()) search.set("q", params.q.trim());
      if (params.status) search.set("status", params.status);
      search.set("page", String(params.page));
      search.set("pageSize", String(pageSize));

      try {
        const response = await fetch(`/api/admin/members?${search}`, {
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          success?: boolean;
          data?: {
            rows: AdminMemberTableRow[];
            total: number;
            page: number;
            pageSize: number;
          };
        };

        if (requestId !== requestIdRef.current) return;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error("fetch_failed");
        }

        setRows(payload.data.rows);
        setTotal(payload.data.total);
        setPage(payload.data.page);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setRows([]);
        setTotal(0);
        setError(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [pageSize],
  );

  useEffect(() => {
    void fetchMembers({ q, status, page });
  }, [fetchMembers, q, status, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = qInput.trim();
      if (next === q) return;
      setPage(1);
      setQ(next);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [qInput, q]);

  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, pageSize]);

  const columns = useMemo(
    () => [
      {
        id: "memberNo",
        header: labels.memberNo,
        className:
          "whitespace-nowrap font-medium text-[var(--color-primary-800)]",
        cell: (row: AdminMemberTableRow) => row.memberNo,
      },
      {
        id: "fullName",
        header: labels.fullName,
        cell: (row: AdminMemberTableRow) => (
          <div>
            <div className="font-medium text-[var(--color-text)]">
              {row.fullName}
            </div>
            {row.businessName !== "—" ? (
              <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {row.businessName}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        id: "district",
        header: labels.district,
        className: "text-[var(--color-text-muted)]",
        cell: (row: AdminMemberTableRow) => row.districtLabel,
      },
      {
        id: "phone",
        header: labels.phone,
        className: "whitespace-nowrap text-[var(--color-text-muted)]",
        cell: (row: AdminMemberTableRow) => row.phone,
      },
      {
        id: "status",
        header: labels.status,
        cell: (row: AdminMemberTableRow) => (
          <StatusBadge label={row.statusLabel} />
        ),
      },
      {
        id: "registeredAt",
        header: labels.registeredAt,
        className: "whitespace-nowrap text-[var(--color-text-muted)]",
        cell: (row: AdminMemberTableRow) => row.registeredLabel || "—",
      },
    ],
    [labels],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-3 py-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <label className="min-w-[180px] flex-1 space-y-1 sm:max-w-xs">
            <span className="block text-xs font-medium text-[var(--color-text-muted)]">
              {labels.search}
            </span>
            <input
              type="search"
              value={qInput}
              onChange={(event) => setQInput(event.target.value)}
              placeholder={labels.search}
              className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm outline-none focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
            />
          </label>
          <label className="min-w-[140px] space-y-1">
            <span className="block text-xs font-medium text-[var(--color-text-muted)]">
              {labels.status}
            </span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm outline-none focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
            >
              <option value="">{labels.all}</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3 self-end">
          <p className="text-xs text-[var(--color-text-muted)]">
            {loading
              ? labels.loading
              : labels.results.replace("{total}", String(total))}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-text-muted)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-3 py-2.5 text-xs font-medium"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(loading ? "opacity-60" : null)}>
            {error ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm text-[var(--color-accent)]"
                >
                  {labels.loadError}
                </td>
              </tr>
            ) : !loading && rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]"
                >
                  {labels.empty}
                </td>
              </tr>
            ) : rows.length === 0 && loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]"
                >
                  {labels.loading}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const href = routes.admin.memberEdit(row.id);
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-soft)]/70"
                    onClick={(event) => {
                      if (isInteractiveTarget(event.target)) return;
                      router.push(href);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      if (isInteractiveTarget(event.target)) return;
                      event.preventDefault();
                      router.push(href);
                    }}
                    tabIndex={0}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "px-3 py-2.5 align-middle",
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-3 py-2.5">
          <p className="text-xs text-[var(--color-text-muted)]">
            {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="inline-flex h-8 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium hover:bg-[var(--color-surface-soft)] disabled:opacity-40"
            >
              {labels.prev}
            </button>
            <button
              type="button"
              disabled={loading || currentPage >= totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="inline-flex h-8 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-medium hover:bg-[var(--color-surface-soft)] disabled:opacity-40"
            >
              {labels.next}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
