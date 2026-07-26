import type { Metadata } from "next";
import Link from "next/link";
import {
  ContentFilterTabs,
  ContentPageHeader,
  Pagination,
} from "@/components/content/post-list";
import {
  EventFeaturedCard,
  EventList,
} from "@/components/content/event-list";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import {
  getFeaturedPublicEvent,
  listPublishedEvents,
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
  const e = messages.events;
  const scope = parseScope(params.kapsam);
  const page = Math.max(1, Number(params.page) || 1);

  const featured =
    scope !== "past" && page === 1 ? await getFeaturedPublicEvent() : null;

  const result = await listPublishedEvents({
    page,
    pageSize: 12,
    scope,
    excludeId: featured?.id,
  });

  const emptyMessage =
    scope === "upcoming"
      ? e.emptyUpcoming
      : scope === "past"
        ? e.emptyPast
        : e.empty;

  const filters = [
    { href: scopeHref("all"), label: e.tabs.all },
    { href: scopeHref("upcoming"), label: e.tabs.upcoming },
    { href: scopeHref("past"), label: e.tabs.past },
  ];

  const listedCount =
    result.total + (featured && page === 1 && scope !== "past" ? 1 : 0);

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
        <ContentPageHeader
          title={e.listTitle}
          description={e.listDescription}
          breadcrumbs={[
            { label: messages.nav.home, href: routes.home },
            { label: e.listTitle },
          ]}
        />

        <p className="-mt-4 mb-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {e.eyebrow}
        </p>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-10">
          <div className="min-w-0 space-y-6">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ContentFilterTabs
                  items={filters}
                  activeHref={scopeHref(scope)}
                  className="mb-0"
                />
                <p className="shrink-0 text-xs text-[var(--color-text-muted)]">
                  {e.resultsCount.replace("{count}", String(listedCount))}
                </p>
              </div>
            </div>

            {featured ? (
              <section aria-labelledby="featured-event-heading">
                <h2 id="featured-event-heading" className="sr-only">
                  {e.nextEvent}
                </h2>
                <EventFeaturedCard event={featured} />
              </section>
            ) : null}

            <section aria-labelledby="events-list-heading" className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <h2
                  id="events-list-heading"
                  className="text-base font-semibold text-[var(--color-primary-900)]"
                >
                  {e.sectionList}
                </h2>
              </div>

              <EventList
                events={result.rows}
                emptyMessage={emptyMessage}
                featuredId={featured?.id}
                variant="agenda"
              />
            </section>

            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              makeHref={(nextPage) => scopeHref(scope, nextPage)}
            />
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                {e.asideTitle}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {e.asideBody}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={routes.membership.apply}
                  className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
                >
                  {e.asideApply}
                </Link>
                <Link
                  href={routes.member.login}
                  className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-primary-800)] transition hover:bg-[var(--color-primary-100)]/40"
                >
                  {messages.nav.memberLogin}
                </Link>
              </div>
            </div>

            <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                {e.asideContactTitle}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href={siteConfig.phoneHref}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--color-primary-800)] hover:underline"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {siteConfig.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--color-primary-800)] hover:underline"
                  >
                    <MailIcon className="h-4 w-4" />
                    {siteConfig.email}
                  </a>
                </li>
              </ul>
            </div>

            <ul className="space-y-2 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5 text-[13px] leading-5 text-[var(--color-text-muted)]">
              <li>{e.tip1}</li>
              <li>{e.tip2}</li>
              <li>{e.tip3}</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
