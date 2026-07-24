import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { EventsDataTable } from "@/components/admin/events-data-table";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { listEvents, listFeaturedEventIds } from "@/services/events";
import { contentStatusSchema } from "@/services/posts";

export const metadata: Metadata = {
  title: "Etkinlikler",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q");
  const statusRaw = getSearchParam(params, "status");
  const status = contentStatusSchema.safeParse(statusRaw).success
    ? (statusRaw as ContentStatus)
    : undefined;

  const [result, featuredIds] = await Promise.all([
    listEvents({
      q: q || undefined,
      status,
      page: tableQuery.page,
      pageSize: tableQuery.pageSize,
    }),
    listFeaturedEventIds(),
  ]);

  const tableRows = result.rows.map((event) => {
    const featuredIndex = featuredIds.indexOf(event.id);
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      startsAtLabel: formatDateTime(event.startsAt),
      registrations: event._count.registrations,
      status: event.status,
      statusLabel: a.statuses[event.status],
      featured: event.featured,
      sortOrder: event.sortOrder,
      canMoveUp: event.featured && featuredIndex > 0,
      canMoveDown:
        event.featured &&
        featuredIndex >= 0 &&
        featuredIndex < featuredIds.length - 1,
    };
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
        rows={tableRows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
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
          featured: a.featured,
          sortOrder: a.sortOrder,
          moveUp: a.moveUp,
          moveDown: a.moveDown,
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
