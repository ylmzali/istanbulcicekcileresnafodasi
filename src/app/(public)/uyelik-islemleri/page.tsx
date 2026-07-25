import type { Metadata } from "next";
import Link from "next/link";
import { MembershipPageShell } from "@/components/membership/membership-page-shell";
import { getMessages } from "@/lib/i18n";
import { membershipRegistration } from "@/lib/membership/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: membershipRegistration.title,
  description: membershipRegistration.description,
};

export default function MembershipPage() {
  const content = membershipRegistration;
  const ui = getMessages().membershipConditions;

  return (
    <MembershipPageShell
      title={content.title}
      description={content.description}
      current={routes.membership.root}
      breadcrumbs={[{ label: "Üyelik İşlemleri" }]}
    >
      <div className="space-y-8 sm:space-y-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {ui.eyebrow}
        </p>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-10">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <header className="mb-4 flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
                  1
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                    {content.whyJoin.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {ui.whyJoinHint}
                  </p>
                </div>
              </header>
              <div className="space-y-4 text-[15px] leading-7 text-[var(--color-text-muted)]">
                {content.whyJoin.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <header className="mb-4 flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
                  2
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                    {content.conditions.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {content.conditions.intro}
                  </p>
                </div>
              </header>
              <ol className="space-y-3">
                {content.conditions.items.map((item, index) => (
                  <li
                    key={item.slice(0, 40)}
                    className="flex gap-3 rounded-[12px] bg-[var(--color-surface-soft)] px-3.5 py-3 text-[14px] leading-6 text-[var(--color-text)]"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[var(--color-primary-800)] ring-1 ring-[var(--color-border)]">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[16px] border border-[color-mix(in_srgb,var(--color-primary-700)_28%,var(--color-border))] bg-[var(--color-primary-100)]/45 p-5 sm:p-6">
              <header className="mb-4 flex items-start gap-3 border-b border-[color-mix(in_srgb,var(--color-primary-700)_18%,transparent)] pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                    {content.process.title}
                  </h2>
                  <p className="mt-1 text-[13px] font-medium text-[var(--color-primary-900)]">
                    {content.process.greeting}
                  </p>
                </div>
              </header>
              <div className="space-y-4 text-[15px] leading-7 text-[var(--color-primary-900)]/85">
                {content.process.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <header className="mb-4 flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
                  4
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                    {content.documents.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {content.documents.intro}
                  </p>
                </div>
              </header>
              <ul className="grid gap-2 sm:grid-cols-2">
                {content.documents.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm font-medium text-[var(--color-text)]"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-700)]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[16px] border border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_6%,white)] p-5 sm:p-6">
              <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                {content.notice.title}
              </h2>
              <div className="mt-3 space-y-3 text-[14px] leading-6 text-[var(--color-text)]">
                {content.notice.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-[linear-gradient(160deg,var(--color-primary-100)_0%,white_55%)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
                {ui.quickTitle}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {ui.quickBody}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {ui.quickHint}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href={routes.membership.apply}
                  className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
                >
                  {ui.applyCta}
                </Link>
                <Link
                  href={routes.membership.applyTrack}
                  className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-800)] transition hover:bg-[var(--color-surface-soft)]"
                >
                  {ui.trackCta}
                </Link>
              </div>
            </div>

            <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {ui.supportTitle}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {ui.supportBody}
              </p>
              <Link
                href={routes.contact}
                className="mt-4 inline-flex text-sm font-semibold text-[var(--color-primary-800)] hover:underline"
              >
                {ui.contactCta}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </MembershipPageShell>
  );
}
