"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  moveBannerSortAction,
  setBannerActiveAction,
} from "@/app/(admin)/yonetim/content-actions";
import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { Checkbox } from "@/components/admin/form-fields";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type BannerTableRow = {
  id: string;
  title: string;
  variantLabel: string;
  sortOrder: number;
  active: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

type BannersDataTableProps = {
  rows: BannerTableRow[];
  total: number;
  page: number;
  pageSize: number;
  query: { q?: string; active?: string };
  labels: DataTableLabels & {
    title: string;
    variant: string;
    sortOrder: string;
    status: string;
    active: string;
    edit: string;
    moveUp: string;
    moveDown: string;
  };
  activeOptions: Array<{ value: string; label: string }>;
};

function SortControls({
  id,
  canMoveUp,
  canMoveDown,
  labels,
}: {
  id: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  labels: { moveUp: string; moveDown: string };
}) {
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      await moveBannerSortAction(id, direction);
    });
  }

  return (
    <div className="inline-flex items-center gap-0.5">
      <button
        type="button"
        disabled={!canMoveUp || pending}
        onClick={() => move("up")}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-primary-800)] transition",
          canMoveUp && !pending
            ? "hover:bg-[var(--color-primary-100)]"
            : "cursor-not-allowed opacity-35",
        )}
        aria-label={labels.moveUp}
        title={labels.moveUp}
      >
        <ChevronUpIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={!canMoveDown || pending}
        onClick={() => move("down")}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-primary-800)] transition",
          canMoveDown && !pending
            ? "hover:bg-[var(--color-primary-100)]"
            : "cursor-not-allowed opacity-35",
        )}
        aria-label={labels.moveDown}
        title={labels.moveDown}
      >
        <ChevronDownIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function ActiveToggle({
  id,
  active,
  label,
}: {
  id: string;
  active: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Checkbox
      id={`banner-active-${id}`}
      name={`banner-active-${id}`}
      checked={active}
      disabled={pending}
      label={label}
      onChange={(event) => {
        const next = event.target.checked;
        startTransition(async () => {
          await setBannerActiveAction(id, next);
        });
      }}
    />
  );
}

export function BannersDataTable({
  rows,
  total,
  page,
  pageSize,
  query,
  labels,
  activeOptions,
}: BannersDataTableProps) {
  const columns: DataTableColumn<BannerTableRow>[] = [
    {
      id: "title",
      header: labels.title,
      cell: (row) => (
        <div className="font-medium text-[var(--color-text)]">{row.title}</div>
      ),
    },
    {
      id: "variant",
      header: labels.variant,
      className: "text-[var(--color-text-muted)]",
      cell: (row) => row.variantLabel,
    },
    {
      id: "sortOrder",
      header: labels.sortOrder,
      headerClassName: "w-28",
      interactive: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-[var(--color-text-muted)]">
            {row.sortOrder + 1}
          </span>
          <SortControls
            id={row.id}
            canMoveUp={row.canMoveUp}
            canMoveDown={row.canMoveDown}
            labels={{ moveUp: labels.moveUp, moveDown: labels.moveDown }}
          />
        </div>
      ),
    },
    {
      id: "active",
      header: labels.active,
      headerClassName: "w-36",
      interactive: true,
      cell: (row) => (
        <ActiveToggle id={row.id} active={row.active} label={labels.active} />
      ),
    },
    {
      id: "actions",
      header: "",
      headerClassName: "w-20",
      className: "text-right",
      interactive: true,
      cell: (row) => (
        <Link
          href={routes.admin.bannerEdit(row.id)}
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
      getRowHref={(row) => routes.admin.bannerEdit(row.id)}
      labels={labels}
      basePath={routes.admin.banners}
      total={total}
      page={page}
      pageSize={pageSize}
      query={{
        q: query.q ?? "",
        active: query.active ?? "",
      }}
      filters={[
        {
          id: "q",
          label: labels.search,
          type: "search",
          placeholder: labels.search,
        },
        {
          id: "active",
          label: labels.status,
          type: "select",
          options: activeOptions,
        },
      ]}
    />
  );
}
