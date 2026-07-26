import Image from "next/image";
import Link from "next/link";
import { EventAddToCalendarButton } from "@/components/content/event-calendar-button";
import { RichTextContent } from "@/components/content/post-list";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type { Event } from "@/generated/prisma/client";
import { eventHref } from "@/lib/content-paths";
import { formatDateTime } from "@/lib/datetime";
import { stripHtml } from "@/lib/html-sanitize";
import { getMessages, t } from "@/lib/i18n";
import { getInputFormat } from "@/lib/input-formats";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

function resolveExternalUrl(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const formatted = getInputFormat("url").format(trimmed);
  if (!formatted || !/^https?:\/\//i.test(formatted)) return null;
  return formatted;
}

export async function EventDetailView({ event }: { event: Event }) {
  const messages = getMessages();
  const upcoming = event.startsAt.getTime() >= Date.now();
  const locationLabel = event.isOnline
    ? messages.events.online
    : event.location;
  const onlineJoinUrl =
    event.isOnline ? resolveExternalUrl(event.onlineUrl) : null;
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");
  const detailUrl = `${baseUrl}${eventHref(event.slug)}`;

  const facts = [
    {
      icon: CalendarIcon,
      label: messages.events.startsAt,
      value: formatDateTime(event.startsAt),
    },
    event.endsAt
      ? {
          icon: ClockIcon,
          label: messages.events.endsAt,
          value: formatDateTime(event.endsAt),
        }
      : null,
    locationLabel
      ? {
          icon: MapPinIcon,
          label: messages.events.location,
          value: locationLabel,
        }
      : null,
    event.capacity
      ? {
          icon: UsersIcon,
          label: messages.events.capacity,
          value: t(messages, "events.capacityValue", {
            count: event.capacity,
          }),
        }
      : null,
    event.registrationOpen
      ? {
          icon: CalendarIcon,
          label: messages.events.registrationOpen,
          value: formatDateTime(event.registrationOpen),
        }
      : null,
    event.registrationClose
      ? {
          icon: ClockIcon,
          label: messages.events.registrationClose,
          value: formatDateTime(event.registrationClose),
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof CalendarIcon;
    label: string;
    value: string;
  }>;

  const plainDescription = event.description
    ? stripHtml(event.description)
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: plainDescription || undefined,
    image: event.coverImage ? [event.coverImage] : undefined,
    startDate: event.startsAt.toISOString(),
    endDate: event.endsAt?.toISOString(),
    eventAttendanceMode: event.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: event.isOnline
      ? {
          "@type": "VirtualLocation",
          url: event.onlineUrl || detailUrl,
        }
      : {
          "@type": "Place",
          name: event.location || siteConfig.name,
          address: event.location || siteConfig.address,
        },
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
      url: baseUrl,
    },
    url: detailUrl,
  };

  return (
    <div className="relative bg-[var(--color-surface-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(90%_60%_at_12%_0%,color-mix(in_srgb,var(--color-primary-100)_85%,transparent),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumb
          items={[
            { label: messages.events.listTitle, href: routes.events.root },
            { label: event.title },
          ]}
          className="mb-7"
        />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:gap-12">
          <div className="min-w-0 space-y-5">
            {event.coverImage ? (
              <figure className="relative aspect-[16/9] overflow-hidden rounded-[22px] bg-[var(--color-primary-100)] shadow-[0_1px_0_rgba(23,35,29,0.04),0_16px_40px_rgba(23,35,29,0.06)] ring-1 ring-[var(--color-border)]">
                <Image
                  src={event.coverImage}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover"
                  priority
                />
              </figure>
            ) : null}

            <article className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(23,35,29,0.04),0_20px_48px_rgba(23,35,29,0.06)] ring-1 ring-[var(--color-border)]">
              <div className="px-5 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
                <header>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold",
                        upcoming
                          ? "bg-[var(--color-primary-100)] text-[var(--color-primary-800)]"
                          : "bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]",
                      )}
                    >
                      {upcoming
                        ? messages.events.upcomingBadge
                        : messages.events.pastBadge}
                    </span>
                  </div>

                  <h1 className="mt-4 text-balance text-[1.85rem] font-bold tracking-[-0.025em] text-[var(--color-primary-900)] sm:text-[2.5rem] sm:leading-[1.15]">
                    {event.title}
                  </h1>

                  <p className="mt-4 text-sm text-[var(--color-text-muted)] sm:text-[15px]">
                    <time dateTime={event.startsAt.toISOString()}>
                      {formatDateTime(event.startsAt)}
                    </time>
                    {locationLabel ? ` · ${locationLabel}` : ""}
                  </p>
                </header>

                <div className="mt-8 border-t border-[var(--color-border)] pt-8">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
                    {messages.events.about}
                  </h2>
                  {event.description ? (
                    <div className="mt-4">
                      <RichTextContent
                        content={event.description}
                        variant="article"
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                      {messages.events.empty}
                    </p>
                  )}
                </div>

                <footer className="mt-10">
                  <Link
                    href={routes.events.root}
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-900)] transition hover:border-[var(--color-primary-100)] hover:bg-[var(--color-primary-100)]"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    {messages.events.backToList}
                  </Link>
                </footer>
              </div>
            </article>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[18px] border border-[var(--color-border)] bg-white/95 p-5 shadow-[0_10px_28px_rgba(23,35,29,0.04)] backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
                {messages.events.details}
              </p>
              <dl className="mt-4 space-y-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-primary-100)] text-[var(--color-primary-800)]">
                      <fact.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
                        {fact.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              {onlineJoinUrl || upcoming ? (
                <div className="mt-5 space-y-2.5 border-t border-[var(--color-border)] pt-5">
                  {onlineJoinUrl ? (
                    <a
                      href={onlineJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-700)]"
                    >
                      {messages.events.joinOnline}
                    </a>
                  ) : null}
                  {upcoming ? (
                    <EventAddToCalendarButton
                      title={event.title}
                      description={plainDescription || null}
                      location={
                        event.isOnline
                          ? messages.events.online
                          : event.location
                      }
                      startsAt={event.startsAt.toISOString()}
                      endsAt={event.endsAt?.toISOString() ?? null}
                      url={detailUrl}
                      uid={`${event.id}@istanbulcicekcileresnafodasi`}
                      label={messages.events.addToCalendar}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-[18px] bg-[var(--color-primary-900)] text-white">
              <div className="border-l-[3px] border-[color-mix(in_srgb,white_35%,transparent)] px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  {messages.events.listTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/88">
                  {messages.events.listDescription}
                </p>
                <Link
                  href={routes.events.root}
                  className="mt-4 inline-flex h-10 items-center rounded-[10px] bg-white px-4 text-sm font-semibold text-[var(--color-primary-900)] transition hover:bg-[var(--color-primary-100)]"
                >
                  {messages.events.calendar} →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
