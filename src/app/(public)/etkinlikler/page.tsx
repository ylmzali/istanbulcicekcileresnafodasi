import type { Metadata } from "next";
import {
  ContentFilterTabs,
  ContentPageHeader,
  Pagination,
} from "@/components/content/post-list";
import {
  EventFeaturedCard,
  EventList,
} from "@/components/content/event-list";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import {
  listPublishedEvents,
  listUpcomingEvents,
} from "@/services/events";

type EventScope = "all" | "upcoming" | "past";

type PageProps = {
  searchParams: Promise<{ page?: string; kapsam?: string }>;
};

export const metadata: Metadata = {
  title: "Etkinlikler",
  description:
    "İstanbul Çiçekçiler Esnaf Odası eğitim, seminer ve etkinlik takvimi.",
};

function parseScope(value?: string): EventScope {
  if (value === "yaklasan" || value === "upcoming") return "upcoming";
  if (value === "gecmis" || value === "past") return "past";
  return "all";
}

function scopeHref(scope: EventScope, page = 1) {
  const params = new URLSearchParams();
  if (scope === "upcoming") params.set("kapsam", "yaklasan");
  if (scope === "past") params.set("kapsam", "gecmis");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${routes.events.root}?${query}` : routes.events.root;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const messages = getMessages();
  const scope = parseScope(params.kapsam);
  const page = Math.max(1, Number(params.page) || 1);

  const [result, nextUpcoming] = await Promise.all([
    listPublishedEvents({
      page,
      pageSize: 12,
      scope,
    }),
    scope !== "past" && page === 1
      ? listUpcomingEvents(1).then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
  ]);

  const featured = nextUpcoming;

  const emptyMessage =
    scope === "upcoming"
      ? messages.events.emptyUpcoming
      : scope === "past"
        ? messages.events.emptyPast
        : messages.events.empty;

  const filters = [
    { href: scopeHref("all"), label: messages.events.tabs.all },
    { href: scopeHref("upcoming"), label: messages.events.tabs.upcoming },
    { href: scopeHref("past"), label: messages.events.tabs.past },
  ];

  return (
    <div className="relative bg-[var(--color-surface-soft)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(90%_60%_at_10%_0%,color-mix(in_srgb,var(--color-primary-100)_80%,transparent),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
        <ContentPageHeader
          title={messages.events.listTitle}
          description={messages.events.listDescription}
          breadcrumbs={[{ label: messages.events.listTitle }]}
        />

        <ContentFilterTabs items={filters} activeHref={scopeHref(scope)} />

        {featured ? (
          <div className="mb-8">
            <EventFeaturedCard event={featured} />
          </div>
        ) : null}

        <EventList
          events={result.rows}
          emptyMessage={emptyMessage}
          featuredId={featured?.id}
        />

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          makeHref={(nextPage) => scopeHref(scope, nextPage)}
        />
      </div>
    </div>
  );
}
