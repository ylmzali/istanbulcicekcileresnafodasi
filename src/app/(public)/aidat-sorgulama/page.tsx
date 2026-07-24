import type { Metadata } from "next";
import Link from "next/link";
import { MembershipPageShell } from "@/components/membership/membership-page-shell";
import { PhoneIcon } from "@/components/ui/icons";
import { duesInquiry } from "@/lib/membership/content";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: duesInquiry.title,
  description: duesInquiry.description,
};

export default function DuesInquiryPage() {
  const content = duesInquiry;

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
      <div className="space-y-10">
        <p className="text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
          {content.intro}
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.halkbank.title}
          </h2>
          <p className="text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
            {content.halkbank.body}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.paymentSteps.title}
          </h2>
          <p className="text-[15px] leading-7 text-[var(--color-text-muted)]">
            {content.paymentSteps.intro}
          </p>
          <ol className="flex flex-wrap items-center gap-2">
            {content.paymentSteps.path.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="inline-flex h-9 items-center rounded-[10px] bg-[var(--color-primary-100)] px-3 text-sm font-semibold text-[var(--color-primary-900)]">
                  {step}
                </span>
                {index < content.paymentSteps.path.length - 1 ? (
                  <span aria-hidden className="text-[var(--color-text-muted)]">
                    ›
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.transfer.title}
          </h2>
          <p className="text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
            {content.transfer.intro}
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Banka
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--color-text)]">
                {content.transfer.bank}
              </dd>
            </div>
            <div className="rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Alıcı Adı
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--color-text)]">
                {content.transfer.recipient}
              </dd>
            </div>
            <div className="sm:col-span-2 rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                IBAN
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold tracking-wide text-[var(--color-primary-900)] sm:text-base">
                {content.transfer.iban}
              </dd>
            </div>
          </dl>
          <p className="border-l-[3px] border-[var(--color-accent)] pl-4 text-[14px] leading-6 text-[var(--color-text)]">
            <span className="font-semibold">Önemle duyurulur: </span>
            {content.transfer.warning}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.legal.title}
          </h2>
          <p className="text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
            {content.legal.body}
          </p>
        </section>

        <section className="rounded-[16px] border border-[var(--color-border)] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--color-primary-900)]">
            {content.contact.title}
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-[var(--color-text-muted)]">
            {content.contact.body}
          </p>
          <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
            {content.contact.hours}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
            >
              <PhoneIcon className="h-4 w-4" />
              {siteConfig.phoneDisplay}
            </a>
            <a
              href={siteConfig.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
            >
              WhatsApp ile İletişim
            </a>
            <Link
              href={routes.contact}
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
            >
              İletişim Formuna Git
            </Link>
          </div>
        </section>
      </div>
    </MembershipPageShell>
  );
}
