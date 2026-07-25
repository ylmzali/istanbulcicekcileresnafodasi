import type { Metadata } from "next";
import Link from "next/link";
import { SupportRequestForm } from "@/components/content/support-request-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bilgi Edinme",
  description:
    "İstanbul Çiçekçiler Esnaf Odası bilgi edinme formu. Talebinizi iletin, takip numarasıyla izleyin.",
};

export default function InformationRequestPage() {
  const t = getMessages().supportForms;
  const page = t.information;

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumb items={[{ label: page.title }]} />
        <header className="mt-2 mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
            {page.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-primary-900)] sm:text-[2.35rem]">
            {page.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
            {page.description}
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-10">
          <div className="min-w-0 space-y-6">
            <p className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-primary-700)_20%,var(--color-border))] bg-[var(--color-primary-100)]/40 px-4 py-3 text-[14px] leading-6 text-[var(--color-primary-900)]">
              {page.intro}
            </p>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <SupportRequestForm mode="information" />
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                {page.trackTitle}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {page.trackBody}
              </p>
              <Link
                href={routes.supportTrack}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
              >
                {t.trackCta}
              </Link>
            </div>

            <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                {page.asideTitle}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {page.asideBody}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href={siteConfig.phoneHref}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--color-primary-800)] hover:underline"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {siteConfig.phoneDisplay}
                  </a>
                </li>
                <li>
                  <Link
                    href={routes.contact}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--color-primary-800)] hover:underline"
                  >
                    <MailIcon className="h-4 w-4" />
                    {getMessages().contact.title}
                  </Link>
                </li>
                <li>
                  <Link
                    href={routes.complaint}
                    className="font-medium text-[var(--color-primary-800)] hover:underline"
                  >
                    {t.complaint.title}
                  </Link>
                </li>
              </ul>
            </div>

            <ul className="space-y-2 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5 text-[13px] leading-5 text-[var(--color-text-muted)]">
              <li>{page.tip1}</li>
              <li>{page.tip2}</li>
              <li>{page.tip3}</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
