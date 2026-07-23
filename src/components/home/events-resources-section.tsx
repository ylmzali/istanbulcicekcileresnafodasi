import { CalendarIcon, DownloadIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function EventsResourcesSection() {
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
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-[14px] border border-[var(--color-border)] bg-white p-3"
              >
                <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center rounded-[12px] bg-[var(--color-primary-800)] text-white">
                  <span className="text-lg font-bold leading-none">—</span>
                  <span className="mt-1 text-[10px] uppercase tracking-wide opacity-80">
                    —
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    {messages.events.empty}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {messages.common.requiredSoon}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={routes.trainings}
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

          <ul className="space-y-2">
            {messages.resources.items.map((item) => (
              <li key={item}>
                <Link
                  href={routes.legislation}
                  className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-3.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary-100)]"
                >
                  <span>{item}</span>
                  <DownloadIcon className="h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
