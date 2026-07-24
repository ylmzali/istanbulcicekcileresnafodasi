import Image from "next/image";
import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { eventHref } from "@/lib/content-paths";
import {
  formatDate,
  formatEventDayParts,
  formatTime,
} from "@/lib/datetime";
import { getMessages, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type PublicEventCard = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventType: string | null;
  location: string | null;
  isOnline: boolean;
  startsAt: Date;
  endsAt?: Date | null;
  capacity?: number | null;
  coverImage: string | null;
};

function isUpcoming(startsAt: Date) {
  return startsAt.getTime() >= Date.now();
}

function EventStatusBadge({ upcoming }: { upcoming: boolean }) {
  const messages = getMessages();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
        upcoming
          ? "bg-[var(--color-primary-100)] text-[var(--color-primary-800)]"
          : "bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]",
      )}
    >
      {upcoming ? messages.events.upcomingBadge : messages.events.pastBadge}
    </span>
  );
}

function EventDateBlock({
  startsAt,
  tone = "solid",
}: {
  startsAt: Date;
  tone?: "solid" | "soft";
}) {
  const parts = formatEventDayParts(startsAt);
  return (
    <div
      className={cn(
        "flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-[14px]",
        tone === "solid"
          ? "bg-[var(--color-primary-800)] text-white"
          : "bg-[var(--color-primary-100)] text-[var(--color-primary-900)]",
      )}
    >
      <span className="text-xl font-bold leading-none tracking-tight">
        {parts.day}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-85">
        {parts.month}
      </span>
    </div>
  );
}

export function EventFeaturedCard({ event }: { event: PublicEventCard }) {
  const messages = getMessages();
  const locationLabel = event.isOnline
    ? messages.events.online
    : event.location;
  const upcoming = isUpcoming(event.startsAt);

  return (
    <article className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(23,35,29,0.04),0_20px_48px_rgba(23,35,29,0.06)] ring-1 ring-[var(--color-border)]">
      <Link
        href={eventHref(event.slug)}
        className="group grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <div className="relative aspect-[16/9] bg-[var(--color-primary-100)] lg:aspect-auto lg:min-h-[280px]">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-primary-800),var(--color-primary-700))]" />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,61,40,0.08)_0%,transparent_45%,rgba(11,61,40,0.35)_100%)]"
          />
        </div>

        <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
              {messages.events.nextEvent}
            </p>
            <EventStatusBadge upcoming={upcoming} />
            {event.eventType ? (
              <span className="text-xs text-[var(--color-text-muted)]">
                {event.eventType}
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-[var(--color-primary-900)] sm:text-[1.75rem] sm:leading-snug">
            {event.title}
          </h2>

          {event.description ? (
            <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[var(--color-text-muted)]">
              {event.description}
            </p>
          ) : null}

          <ul className="mt-5 space-y-2 text-sm text-[var(--color-text)]">
            <li className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[var(--color-primary-700)]" />
              <time dateTime={event.startsAt.toISOString()}>
                {formatDate(event.startsAt)}
              </time>
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-[var(--color-primary-700)]" />
              <span>
                {formatTime(event.startsAt)}
                {event.endsAt ? ` – ${formatTime(event.endsAt)}` : ""}
              </span>
            </li>
            {locationLabel ? (
              <li className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-[var(--color-primary-700)]" />
                <span>{locationLabel}</span>
              </li>
            ) : null}
          </ul>

          <span className="mt-6 inline-flex h-10 w-fit items-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-semibold text-white transition group-hover:bg-[var(--color-primary-700)]">
            {messages.events.details} →
          </span>
        </div>
      </Link>
    </article>
  );
}

export function EventCard({ event }: { event: PublicEventCard }) {
  const messages = getMessages();
  const upcoming = isUpcoming(event.startsAt);
  const locationLabel = event.isOnline
    ? messages.events.online
    : event.location;

  return (
    <article className="overflow-hidden rounded-[18px] bg-white ring-1 ring-[var(--color-border)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(23,35,29,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link href={eventHref(event.slug)} className="group flex h-full flex-col">
        <div className="relative aspect-[16/9] bg-[var(--color-primary-100)]">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,var(--color-primary-800),#173528)]">
              <EventDateBlock startsAt={event.startsAt} />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start gap-3">
            {event.coverImage ? (
              <EventDateBlock startsAt={event.startsAt} tone="soft" />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <EventStatusBadge upcoming={upcoming} />
                {event.eventType ? (
                  <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                    {event.eventType}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-2 line-clamp-2 text-[1.05rem] font-bold leading-snug tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-primary-800)]">
                {event.title}
              </h2>
            </div>
          </div>

          {event.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
              {event.description}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 pt-4 text-xs text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatTime(event.startsAt)}
            </span>
            {locationLabel ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{locationLabel}</span>
              </span>
            ) : null}
            {event.capacity ? (
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon className="h-3.5 w-3.5" />
                {t(messages, "events.capacityValue", {
                  count: event.capacity,
                })}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function EventList({
  events,
  emptyMessage,
  featuredId,
}: {
  events: PublicEventCard[];
  emptyMessage?: string;
  featuredId?: string | null;
}) {
  const messages = getMessages();
  const listEvents = featuredId
    ? events.filter((event) => event.id !== featuredId)
    : events;

  if (events.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-primary-100)] text-[var(--color-primary-800)]">
          <CalendarIcon className="h-5 w-5" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          {emptyMessage ?? messages.events.empty}
        </p>
      </div>
    );
  }

  if (listEvents.length === 0) {
    return null;
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {listEvents.map((event) => (
        <li key={event.id}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}
