import { PresidentPartnerLogos } from "@/components/corporate/president-partner-logos";
import { PresidentPortraitAside } from "@/components/corporate/president-portrait-aside";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function PresidentMessageSection() {
  const messages = getMessages();
  const content = messages.presidentMessage;

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(ellipse_at_left,color-mix(in_srgb,var(--color-primary-100)_80%,transparent)_0%,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-[1280px] items-start gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_auto] lg:gap-10 lg:py-16">
        <PresidentPortraitAside />

        <div className="relative min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-700)]">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight text-[var(--color-primary-900)] sm:text-3xl sm:leading-tight">
            {content.title}
          </h2>

          <div className="relative mt-6 max-w-2xl">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-1 -top-6 font-serif text-7xl leading-none text-[var(--color-primary-100)] select-none sm:-left-3 sm:text-8xl"
            >
              “
            </span>
            <div className="space-y-4 text-[15px] leading-7 text-[var(--color-text-muted)] sm:text-base sm:leading-8">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={routes.corporate.presidentMessage}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
            >
              {content.cta}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <PresidentPartnerLogos className="grid w-[14rem] shrink-0 grid-cols-2 gap-3 justify-self-center sm:w-[15.5rem] sm:gap-3.5 lg:justify-self-end lg:pt-1" />
      </div>
    </section>
  );
}
