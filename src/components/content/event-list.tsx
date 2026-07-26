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

export function EventDateBlock({
  startsAt,
  tone = "solid",
  size = "md",
}: {
  startsAt: Date;
  tone?: "solid" | "soft";
  size?: "md" | "lg";
}) {
  const parts = formatEventDayParts(startsAt);
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-[14px]",
        size === "lg" ? "h-[5.25rem] w-[5.25rem]" : "h-[4.5rem] w-[4.5rem]",
        tone === "solid"
          ? "bg-[var(--color-primary-800)] text-white"
          : "bg-[var(--color-primary-100)] text-[var(--color-primary-900)]",
      )}
    >
      <span
        className={cn(
          "font-bold leading-none tracking-tight",
          size === "lg" ? "text-2xl" : "text-xl",
        )}
      >
        {parts.day}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-85">
        {parts.month}
      </span>
    </div>
  );
}

function eventLocationLabel(event: PublicEventCard) {
  const messages = getMessages();
  return event.isOnline ? messages.events.online : event.location;
}

export function EventFeaturedCard({ event }: { event: PublicEventCard }) {
  const messages = getMessages();
  const locationLabel = eventLocationLabel(event);
  const upcoming = isUpcoming(event.startsAt);

  return (
    <article className="overflow-hidden rounded-[18px] border border-[color-mix(in_srgb,var(--color-primary-700)_28%,var(--color-border))] bg-white shadow-[0_12px_30px_rgba(23,35,29,0.05)]">
      <Link
        href={eventHref(event.slug)}
        className="group grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
      >
        <div className="relative aspect-[16/10] bg-[var(--color-primary-100)] lg:aspect-auto lg:min-h-[260px]">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,var(--color-primary-900),var(--color-primary-700))]">
              <EventDateBlock startsAt={event.startsAt} size="lg" />
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,61,40,0.05)_0%,transparent_50%,rgba(11,61,40,0.28)_100%)]"
          />
        </div>

        <div className="flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
              {messages.events.nextEvent}
            </p>
            <EventStatusBadge upcoming={upcoming} />
            {event.eventType ? (
              <span className="rounded-md bg-[var(--color-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                {event.eventType}
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-[var(--color-primary-900)] sm:text-[1.7rem] sm:leading-snug">
            {event.title}
          </h2>

          {event.description ? (
            <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-[var(--color-text-muted)]">
              {event.description}
            </p>
          ) : null}

          <ul className="mt-5 grid gap-2 text-sm text-[var(--color-text)] sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
              <time dateTime={event.startsAt.toISOString()}>
                {formatDate(event.startsAt)}
              </time>
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
              <span>
                {formatTime(event.startsAt)}
                {event.endsAt ? ` – ${formatTime(event.endsAt)}` : ""}
              </span>
            </li>
            {locationLabel ? (
              <li className="flex items-center gap-2 sm:col-span-2">
                <MapPinIcon className="h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                <span>{locationLabel}</span>
              </li>
            ) : null}
          </ul>

          <span className="mt-6 inline-flex h-10 w-fit items-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition group-hover:bg-[var(--color-primary-700)]">
            {messages.events.details} →
          </span>
        </div>
      </Link>
    </article>
  );
}

/** Agenda-style row — primary list presentation for the calendar page. */
export function EventAgendaRow({ event }: { event: PublicEventCard }) {
  const messages = getMessages();
  const upcoming = isUpcoming(event.startsAt);
  const locationLabel = eventLocationLabel(event);

  return (
    <article>
      <Link
        href={eventHref(event.slug)}
        className={cn(
          "group flex gap-4 rounded-[16px] border bg-white px-4 py-4 transition sm:gap-5 sm:px-5",
          upcoming
            ? "border-[var(--color-border)] hover:border-[color-mix(in_srgb,var(--color-primary-700)_35%,var(--color-border))] hover:shadow-[0_10px_28px_rgba(23,35,29,0.06)]"
            : "border-[var(--color-border)] opacity-90 hover:opacity-100",
        )}
      >
        <EventDateBlock
          startsAt={event.startsAt}
          tone={upcoming ? "solid" : "soft"}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge upcoming={upcoming} />
            {event.eventType ? (
              <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                {event.eventType}
              </span>
            ) : null}
          </div>

          <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-[var(--color-text)] transition group-hover:text-[var(--color-primary-800)] sm:text-[1.05rem]">
            {event.title}
          </h2>

          {event.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
              {event.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatTime(event.startsAt)}
              {event.endsAt ? ` – ${formatTime(event.endsAt)}` : ""}
            </span>
            {locationLabel ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{locationLabel}</span>
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

        <span className="hidden shrink-0 self-center text-sm font-semibold text-[var(--color-primary-800)] sm:inline">
          {messages.events.viewDetails} →
        </span>
      </Link>
    </article>
  );
}

export function EventCard({ event }: { event: PublicEventCard }) {
  const messages = getMessages();
  const upcoming = isUpcoming(event.startsAt);
  const locationLabel = eventLocationLabel(event);

  return (
    <article className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-white transition hover:border-[color-mix(in_srgb,var(--color-primary-700)_30%,var(--color-border))] hover:shadow-[0_12px_28px_rgba(23,35,29,0.06)]">
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
              <h2 className="mt-2 line-clamp-2 text-[1.05rem] font-semibold leading-snug tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-primary-800)]">
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
  variant = "agenda",
}: {
  events: PublicEventCard[];
  emptyMessage?: string;
  featuredId?: string | null;
  variant?: "agenda" | "grid";
}) {
  const messages = getMessages();
  const listEvents = featuredId
    ? events.filter((event) => event.id !== featuredId)
    : events;

  if (events.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-[var(--color-border)] bg-white px-6 py-14 text-center">
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

  if (variant === "grid") {
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

  return (
    <ul className="space-y-3">
      {listEvents.map((event) => (
        <li key={event.id}>
          <EventAgendaRow event={event} />
        </li>
      ))}
    </ul>
  );
}
