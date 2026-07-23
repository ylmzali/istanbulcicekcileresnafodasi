import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function NewsSection() {
  const messages = getMessages();
  const tabs = Object.entries(messages.news.tabs);

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5 shadow-[0_10px_28px_rgba(23,35,29,0.04)] sm:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              {messages.news.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label={messages.news.title}
              >
                {tabs.map(([key, label], index) => (
                  <span
                    key={key}
                    role="tab"
                    aria-selected={index === 0}
                    className={
                      index === 0
                        ? "rounded-full bg-[var(--color-primary-800)] px-3 py-1.5 text-xs font-semibold text-white"
                        : "rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]"
                    }
                  >
                    {label}
                  </span>
                ))}
              </div>
              <Link
                href={routes.news.root}
                className="ml-auto text-sm font-semibold text-[var(--color-primary-800)] hover:underline lg:ml-2"
              >
                Tüm Haberleri Gör →
              </Link>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <article className="overflow-hidden rounded-[18px] border border-[var(--color-border)]">
              <div className="relative min-h-[240px] bg-[linear-gradient(145deg,#0E5A39,#173528)] p-6 text-white">
                <span className="inline-flex rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold">
                  {messages.news.tabs.chamber}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgba(0,0,0,0.55))] p-6 pt-16">
                  <h3 className="text-xl font-bold leading-snug">
                    {messages.news.empty}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    {messages.common.requiredSoon}
                  </p>
                  <Link
                    href={routes.news.root}
                    className="mt-3 inline-flex text-sm font-semibold text-white hover:underline"
                  >
                    Haberi İncele →
                  </Link>
                </div>
              </div>
            </article>

            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <article
                  key={item}
                  className="flex gap-4 rounded-[14px] border border-[var(--color-border)] p-3.5"
                >
                  <div className="h-[72px] w-[72px] shrink-0 rounded-[12px] bg-[var(--color-primary-100)]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-accent)]">
                      —
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-[var(--color-text)]">
                      {messages.news.empty}
                    </h3>
                    <Link
                      href={routes.news.root}
                      className="mt-2 inline-flex text-xs font-semibold text-[var(--color-primary-800)] hover:underline"
                    >
                      Detayları İncele →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
