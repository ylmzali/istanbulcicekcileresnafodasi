import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { EventsDataTable } from "@/components/admin/events-data-table";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { listEvents } from "@/services/events";
import { contentStatusSchema } from "@/services/posts";

export const metadata: Metadata = {
  title: "Etkinlikler",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q");
  const statusRaw = getSearchParam(params, "status");
  const status = contentStatusSchema.safeParse(statusRaw).success
    ? (statusRaw as ContentStatus)
    : undefined;

  const { rows, total, page, pageSize } = await listEvents({
    q: q || undefined,
    status,
    page: tableQuery.page,
    pageSize: tableQuery.pageSize,
  });

  return (
    <div>
      <AdminPageHeader
        title={a.events}
        actions={
          <Link href={routes.admin.eventNew}>
            <Button size="sm">{a.newItem}</Button>
          </Link>
        }
      />

      <EventsDataTable
        rows={rows.map((event) => ({
          id: event.id,
          title: event.title,
          startsAtLabel: formatDate(event.startsAt),
          registrations: event._count.registrations,
          status: event.status,
          statusLabel: a.statuses[event.status],
        }))}
        total={total}
        page={page}
        pageSize={pageSize}
        query={{ q, status: statusRaw }}
        labels={{
          search: a.search,
          all: a.filterAll,
          empty: a.empty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          title: a.title,
          startsAt: a.startsAt,
          status: a.status,
          edit: a.edit,
          registrations: a.registrations,
        }}
        statusOptions={Object.entries(a.statuses).map(([value, label]) => ({
          value,
          label,
        }))}
      />
    </div>
  );
}
