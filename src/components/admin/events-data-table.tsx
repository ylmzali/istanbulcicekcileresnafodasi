"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  moveEventSortAction,
  setEventFeaturedAction,
} from "@/app/(admin)/yonetim/content-actions";
import {
  AdminDataTable,
  type DataTableColumn,
  type DataTableLabels,
} from "@/components/admin/data-table";
import { Checkbox, StatusBadge } from "@/components/admin/form-fields";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type EventTableRow = {
  id: string;
  title: string;
  slug: string;
  startsAtLabel: string;
  registrations: number;
  status: string;
  statusLabel: string;
  featured: boolean;
  sortOrder: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
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
    featured: string;
    sortOrder: string;
    moveUp: string;
    moveDown: string;
    edit: string;
    registrations: string;
  };
  statusOptions: Array<{ value: string; label: string }>;
};

function FeaturedToggle({
  id,
  featured,
  label,
}: {
  id: string;
  featured: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Checkbox
      id={`event-featured-${id}`}
      name={`event-featured-${id}`}
      checked={featured}
      disabled={pending}
      label={label}
      onChange={(event) => {
        const next = event.target.checked;
        startTransition(async () => {
          await setEventFeaturedAction(id, next);
        });
      }}
    />
  );
}

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
      await moveEventSortAction(id, direction);
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
            {row.slug} · {row.registrations} {labels.registrations}
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
      id: "featured",
      header: labels.featured,
      headerClassName: "w-36",
      interactive: true,
      cell: (row) => (
        <FeaturedToggle
          id={row.id}
          featured={row.featured}
          label={labels.featured}
        />
      ),
    },
    {
      id: "sortOrder",
      header: labels.sortOrder,
      headerClassName: "w-28",
      interactive: true,
      cell: (row) =>
        row.featured ? (
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
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
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
      getRowHref={(row) => routes.admin.eventEdit(row.id)}
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
