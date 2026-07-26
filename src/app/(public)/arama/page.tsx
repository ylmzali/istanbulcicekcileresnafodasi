import type { Metadata } from "next";
import { SiteSearchPageOpener } from "@/components/layout/site-search-page-opener";
import { SiteSearchTrigger } from "@/components/layout/site-search";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Site İçi Arama",
  description:
    "Haber, duyuru, etkinlik, mevzuat ve sık sorulan sorularda arama yapın.",
};

export default function SearchPage() {
  const t = getMessages().search;

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <SiteSearchPageOpener />
      <div className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumb items={[{ label: t.title }]} />
        <header className="mt-2 mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary-900)]">
            {t.title}
          </h1>
          <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">
            {t.description}
          </p>
        </header>

        <div className="rounded-[18px] border border-[var(--color-border)] bg-white px-5 py-8 text-center shadow-[0_12px_30px_rgba(23,35,29,0.04)]">
          <p className="text-sm text-[var(--color-text-muted)]">{t.hint}</p>
          <SiteSearchTrigger
            showLabel
            label={t.openLabel}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white hover:bg-[var(--color-primary-700)]"
          />
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Kısayol: ⌘K / Ctrl+K
          </p>
        </div>
      </div>
    </div>
  );
}
