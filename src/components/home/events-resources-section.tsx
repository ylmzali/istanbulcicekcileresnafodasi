import { CalendarIcon, DownloadIcon } from "@/components/ui/icons";
import { eventHref } from "@/lib/content-paths";
import { formatEventDayParts } from "@/lib/datetime";
import { stripHtml } from "@/lib/html-sanitize";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import type { PublicResourceItem } from "@/services/resources";
import Link from "next/link";

export type HomeEventItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  isOnline: boolean;
  startsAt: Date;
};

export function EventsResourcesSection({
  events,
  resources,
}: {
  events: HomeEventItem[];
  resources: PublicResourceItem[];
}) {
  const messages = getMessages();

  return (
    <section className="border-b border-[var(--color-border)] bg-white py-14">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 sm:px-6 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                {messages.events.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {messages.events.description}
              </p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[var(--color-primary-700)] ring-1 ring-[var(--color-border)]">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="rounded-[14px] border border-dashed border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                {messages.events.empty}
              </p>
            ) : (
              events.map((event) => {
                const parts = formatEventDayParts(event.startsAt);
                const meta = [
                  event.isOnline ? messages.events.online : event.location,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <Link
                    key={event.id}
                    href={eventHref(event.slug)}
                    className="flex gap-3 rounded-[14px] border border-[var(--color-border)] bg-white p-3 transition hover:border-[var(--color-primary-100)]"
                  >
                    <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-[12px] bg-[var(--color-primary-800)] text-white">
                      <span className="text-lg font-bold leading-none">
                        {parts.day}
                      </span>
                      <span className="mt-1 text-[10px] uppercase tracking-wide opacity-80">
                        {parts.month}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {event.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-muted)]">
                        {meta ||
                          (event.description
                            ? stripHtml(event.description)
                            : "") ||
                          messages.events.details}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <Link
            href={routes.events.root}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white hover:bg-[var(--color-primary-700)]"
          >
            {messages.events.calendar}
          </Link>
        </div>

        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                {messages.resources.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {messages.resources.description}
              </p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[var(--color-primary-700)] ring-1 ring-[var(--color-border)]">
              <DownloadIcon className="h-5 w-5" />
            </div>
          </div>

          {resources.length === 0 ? (
            <p className="rounded-[14px] border border-dashed border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
              {messages.resources.empty}
            </p>
          ) : (
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.downloadHref}
                    className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-3.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary-100)]"
                  >
                    <span className="min-w-0">
                      <span className="block">{item.title}</span>
                      {item.category ? (
                        <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-muted)]">
                          {item.category}
                        </span>
                      ) : null}
                    </span>
                    <DownloadIcon className="h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={routes.legislation}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-primary-800)] hover:bg-white/80"
          >
            {messages.resources.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}
