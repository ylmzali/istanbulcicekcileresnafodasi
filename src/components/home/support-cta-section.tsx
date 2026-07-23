import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function SupportCtaSection() {
  const messages = getMessages();

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[22px] bg-[var(--color-primary-800)] px-6 py-8 text-white sm:px-10">
          <div
            className="pointer-events-none absolute -left-8 top-0 h-full w-40 opacity-15"
            aria-hidden
          >
            <svg viewBox="0 0 120 160" className="h-full w-full fill-current">
              <path d="M20 140c20-30 28-55 20-90 18 20 34 48 34 90-18 0-36 0-54 0Z" />
              <path d="M70 150c16-28 22-52 16-86 14 18 26 44 26 86-14 0-28 0-42 0Z" />
            </svg>
          </div>
          <div
            className="pointer-events-none absolute -right-6 bottom-0 h-full w-36 rotate-180 opacity-15"
            aria-hidden
          >
            <svg viewBox="0 0 120 160" className="h-full w-full fill-current">
              <path d="M20 140c20-30 28-55 20-90 18 20 34 48 34 90-18 0-36 0-54 0Z" />
            </svg>
          </div>

          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <h2 className="max-w-xl text-2xl font-bold sm:text-3xl">
              {messages.supportCta.finalTitle}
            </h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href={routes.membership.apply}
                className="inline-flex h-11 min-w-[200px] items-center justify-center rounded-[10px] bg-white px-5 text-sm font-bold text-[var(--color-primary-900)] hover:bg-[var(--color-primary-100)]"
              >
                {messages.supportCta.apply}
              </Link>
              <Link
                href={routes.membership.root}
                className="inline-flex h-11 min-w-[200px] items-center justify-center rounded-[10px] border border-white/40 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {messages.supportCta.conditions}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
