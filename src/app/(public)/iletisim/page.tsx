import type { Metadata } from "next";
import { ContactForm } from "@/components/content/contact-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "İstanbul Çiçekçiler Esnaf Odası iletişim bilgileri, çalışma saatleri ve iletişim formu.",
};

export default function ContactPage() {
  const t = getMessages().contact;
  const { lat, lng } = siteConfig.map;
  const delta = 0.008;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumb items={[{ label: t.title }]} />
        <header className="mt-2 mb-8 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary-900)] sm:text-[2.35rem]">
            {t.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
            {t.description}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-6">
            <section className="rounded-[22px] border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_30px_rgba(23,35,29,0.04)] sm:p-7">
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                {t.infoTitle}
              </h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
                    {t.address}
                  </dt>
                  <dd className="mt-1 text-[var(--color-text)]">
                    {siteConfig.address}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
                    {t.phone}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={siteConfig.phoneHref}
                      className="inline-flex items-center gap-1.5 font-medium text-[var(--color-primary-800)] hover:underline"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      {siteConfig.phoneDisplay}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
                    {t.email}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="inline-flex items-center gap-1.5 font-medium text-[var(--color-primary-800)] hover:underline"
                    >
                      <MailIcon className="h-4 w-4" />
                      {siteConfig.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
                    {t.kep}
                  </dt>
                  <dd className="mt-1 text-[var(--color-text)]">{siteConfig.kep}</dd>
                </div>
              </dl>

              <h3 className="mt-6 text-sm font-semibold text-[var(--color-text)]">
                {t.hoursTitle}
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--color-text-muted)]">
                {siteConfig.workingHours.map((row) => (
                  <li
                    key={row.days}
                    className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] py-1.5 last:border-0"
                  >
                    <span>{row.days}</span>
                    <span className="font-medium text-[var(--color-text)]">
                      {row.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[22px] border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_30px_rgba(23,35,29,0.04)] sm:p-7">
              <h2 className="text-base font-semibold text-[var(--color-text)]">
                {t.departmentsTitle}
              </h2>
              <ul className="mt-4 space-y-3">
                {siteConfig.departments.map((dept) => (
                  <li
                    key={dept.name}
                    className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {dept.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {dept.description}
                    </p>
                    <a
                      href={dept.phoneHref}
                      className="mt-2 inline-flex text-sm font-medium text-[var(--color-primary-800)] hover:underline"
                    >
                      {dept.phoneDisplay}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-white shadow-[0_12px_30px_rgba(23,35,29,0.04)]">
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">
                  {t.mapTitle}
                </h2>
                <a
                  href={siteConfig.map.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[var(--color-primary-800)] hover:underline"
                >
                  {t.openInMaps}
                </a>
              </div>
              <iframe
                title={t.mapTitle}
                src={osmEmbed}
                className="h-64 w-full border-t border-[var(--color-border)]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </section>
          </div>

          <section className="rounded-[22px] border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_30px_rgba(23,35,29,0.04)] sm:p-8">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              {t.formTitle}
            </h2>
            <p className="mt-1.5 mb-5 text-sm text-[var(--color-text-muted)]">
              {t.formDescription}
            </p>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  );
}
