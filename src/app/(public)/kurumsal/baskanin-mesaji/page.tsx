import type { Metadata } from "next";
import { CorporatePageShell } from "@/components/corporate/corporate-page-shell";
import { PresidentPartnerLogos } from "@/components/corporate/president-partner-logos";
import { PresidentPortraitAside } from "@/components/corporate/president-portrait-aside";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Başkanın Mesajı",
  description:
    "İstanbul Çiçekçiler Esnaf Odası Başkanı Selçuk Kösedağı’nın mesajı.",
};

export default function PresidentMessagePage() {
  const content = getMessages().presidentMessage;

  return (
    <CorporatePageShell
      title={content.eyebrow}
      description={content.title}
      current={routes.corporate.presidentMessage}
      breadcrumbs={[
        { label: "Kurumsal", href: routes.corporate.root },
        { label: content.eyebrow },
      ]}
    >
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-12">
        <div className="mx-auto flex w-full max-w-[280px] flex-col gap-6 lg:mx-0">
          <PresidentPortraitAside showLeftGutter={false} />
          <PresidentPartnerLogos className="w-full sm:w-full" />
        </div>

        <div className="min-w-0">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-1 -top-5 font-serif text-7xl leading-none text-[var(--color-primary-100)] select-none"
            >
              “
            </span>
            <div className="space-y-5 text-[15px] leading-7 text-[var(--color-text)] sm:text-base sm:leading-8">
              {content.pageParagraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-[var(--color-text-muted)] first:font-medium first:text-[var(--color-text)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-[var(--color-border)] pt-6">
            <p className="text-base font-semibold text-[var(--color-primary-900)]">
              {content.name}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {content.role}
            </p>
          </div>
        </div>
      </div>
    </CorporatePageShell>
  );
}
