import type { Metadata } from "next";
import { CorporatePageShell } from "@/components/corporate/corporate-page-shell";
import { chamberHistory } from "@/lib/corporate/content";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Oda Hakkında",
  description:
    "İstanbul Çiçekçiler Esnaf Odası’nın tarihçesi, ihtisas alanı ve kurumsal kimliği.",
};

export default function CorporatePage() {
  return (
    <CorporatePageShell
      title="Oda Hakkında"
      description={`${siteConfig.name} — ${chamberHistory.foundedYear}’dan bugüne.`}
      current={routes.corporate.root}
      breadcrumbs={[{ label: "Kurumsal" }]}
    >
      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-9 items-center rounded-full bg-[var(--color-primary-800)] px-4 text-xs font-semibold tracking-wide text-white">
            Kuruluş {chamberHistory.foundedYear}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            Kamu kurumu niteliğinde meslek kuruluşu
          </span>
        </div>

        <p className="border-l-[3px] border-[var(--color-primary-700)] pl-4 text-[15px] leading-7 text-[var(--color-text)] sm:text-base sm:leading-8">
          {chamberHistory.scope}
        </p>

        <div className="space-y-5 text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
          {chamberHistory.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </CorporatePageShell>
  );
}
