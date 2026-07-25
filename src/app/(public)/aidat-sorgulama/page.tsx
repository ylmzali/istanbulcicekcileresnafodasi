import type { Metadata } from "next";
import Link from "next/link";
import { MembershipPageShell } from "@/components/membership/membership-page-shell";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { duesInquiry } from "@/lib/membership/content";
import { memberLoginHref, routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: duesInquiry.title,
  description: duesInquiry.description,
};

export default function DuesInquiryPage() {
  const content = duesInquiry;
  const ui = getMessages().duesInquiryPage;

  return (
    <MembershipPageShell
      title={content.title}
      description={content.description}
      current={routes.membership.dues}
      breadcrumbs={[
        { label: "Üyelik İşlemleri", href: routes.membership.root },
        { label: content.title },
      ]}
    >
      <div className="space-y-8 sm:space-y-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {ui.eyebrow}
        </p>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-10">
          <div className="min-w-0 space-y-6">
            <p className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-primary-700)_20%,var(--color-border))] bg-[var(--color-primary-100)]/40 px-4 py-3 text-[14px] leading-6 text-[var(--color-primary-900)]">
              {content.intro}
            </p>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <header className="mb-4 flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
                  1
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                    {content.halkbank.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {ui.halkbankHint}
                  </p>
                </div>
              </header>
              <p className="text-[15px] leading-7 text-[var(--color-text-muted)]">
                {content.halkbank.body}
              </p>
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <header className="mb-4 flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
                  2
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                    {content.paymentSteps.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {content.paymentSteps.intro}
                  </p>
                </div>
              </header>
              <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {content.paymentSteps.path.map((step, index) => (
                  <li
                    key={step}
                    className="relative rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3.5 py-3"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary-700)]">
                      {ui.stepLabel.replace("{n}", String(index + 1))}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5 sm:p-6">
              <header className="mb-4 flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                    {content.transfer.title}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                    {content.transfer.intro}
                  </p>
                </div>
              </header>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {ui.bank}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--color-text)]">
                    {content.transfer.bank}
                  </dd>
                </div>
                <div className="rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {ui.recipient}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--color-text)]">
                    {content.transfer.recipient}
                  </dd>
                </div>
                <div className="sm:col-span-2 rounded-[12px] border border-[color-mix(in_srgb,var(--color-primary-700)_30%,var(--color-border))] bg-white px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {ui.iban}
                  </dt>
                  <dd className="mt-2 break-all font-mono text-base font-semibold tracking-wide text-[var(--color-primary-900)] sm:text-lg">
                    {content.transfer.iban}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 rounded-[12px] border border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_6%,white)] px-4 py-3 text-[13px] leading-6 text-[var(--color-text)]">
                <span className="font-semibold text-[var(--color-accent)]">
                  {ui.warningLabel}{" "}
                </span>
                {content.transfer.warning}
              </p>
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                {content.legal.title}
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[var(--color-text-muted)]">
                {content.legal.body}
              </p>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-[linear-gradient(160deg,var(--color-primary-100)_0%,white_55%)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
                {ui.portalEyebrow}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {ui.portalTitle}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {ui.portalBody}
              </p>
              <Link
                href={memberLoginHref("aidat")}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
              >
                {ui.portalCta}
              </Link>
            </div>

            <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                {content.contact.title}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {content.contact.body}
              </p>
              <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
                {content.contact.hours}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 text-sm font-semibold text-[var(--color-primary-800)] transition hover:border-[var(--color-primary-700)]"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {siteConfig.phoneDisplay}
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
                >
                  <MailIcon className="h-4 w-4" />
                  {ui.emailCta}
                </a>
                <Link
                  href={routes.contact}
                  className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
                >
                  {ui.contactFormCta}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MembershipPageShell>
  );
}
