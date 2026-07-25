import type { Metadata } from "next";
import Link from "next/link";
import { ContentPageHeader } from "@/components/content/post-list";
import { DownloadIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  formatResourceFileSize,
  formatResourceFileType,
  listPublicResourceCategories,
  listPublicResourcesPage,
} from "@/services/resources";

export const metadata: Metadata = {
  title: "Mevzuat ve Faydalı Kaynaklar",
  description:
    "İstanbul Çiçekçiler Esnaf Odası mevzuat, yönetmelik, form ve indirilebilir belgeler.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function paramValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export default async function LegislationPage({ searchParams }: PageProps) {
  const messages = getMessages();
  const t = messages.resources;
  const params = await searchParams;
  const q = paramValue(params, "q");
  const category = paramValue(params, "kategori");

  const [categories, result] = await Promise.all([
    listPublicResourceCategories(),
    listPublicResourcesPage({
      pageSize: 48,
      q: q || undefined,
      category: category || undefined,
    }),
  ]);

  const grouped = new Map<string, typeof result.items>();
  for (const item of result.items) {
    const key = item.category?.trim() || t.uncategorized;
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  const categoryEntries = Array.from(grouped.entries());

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
        <ContentPageHeader
          title={t.title}
          description={t.description}
          breadcrumbs={[
            { label: messages.nav.home, href: routes.home },
            { label: messages.nav.legislation },
          ]}
        />

        <p className="-mt-4 mb-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {t.eyebrow}
        </p>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-10">
          <div className="min-w-0 space-y-6">
            <form
              className="rounded-[16px] border border-[var(--color-border)] bg-white p-4 sm:p-5"
              method="get"
            >
              {category ? (
                <input type="hidden" name="kategori" value={category} />
              ) : null}
              <label
                htmlFor="resource-q"
                className="block text-xs font-medium text-[var(--color-text-muted)]"
              >
                {t.searchLabel}
              </label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="resource-q"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder={t.searchPlaceholder}
                  className="h-10 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none transition focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-700)]"
                >
                  {t.searchSubmit}
                </button>
              </div>
            </form>

            {categories.length > 0 ? (
              <nav aria-label={t.categoryFilter}>
                <ul className="flex flex-wrap gap-2">
                  <li>
                    <Link
                      href={
                        q
                          ? `${routes.legislation}?q=${encodeURIComponent(q)}`
                          : routes.legislation
                      }
                      className={cn(
                        "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition",
                        !category
                          ? "bg-[var(--color-primary-800)] text-white"
                          : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary-700)]",
                      )}
                    >
                      {t.allCategories}
                    </Link>
                  </li>
                  {categories.map((name) => {
                    const href = new URLSearchParams();
                    if (q) href.set("q", q);
                    href.set("kategori", name);
                    const active = category === name;
                    return (
                      <li key={name}>
                        <Link
                          href={`${routes.legislation}?${href.toString()}`}
                          className={cn(
                            "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition",
                            active
                              ? "bg-[var(--color-primary-800)] text-white"
                              : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary-700)]",
                          )}
                        >
                          {name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}

            <p className="text-sm text-[var(--color-text-muted)]">
              {t.countLabel.replace("{count}", String(result.total))}
              {category ? ` · ${category}` : null}
              {q ? ` · “${q}”` : null}
            </p>

            {result.items.length === 0 ? (
              <p className="rounded-[16px] border border-dashed border-[var(--color-border)] bg-white px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                {q || category ? t.emptyFiltered : t.empty}
              </p>
            ) : (
              <div className="space-y-8">
                {categoryEntries.map(([groupName, items]) => (
                  <section key={groupName} className="space-y-3">
                    {!category ? (
                      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-primary-800)]">
                        <span className="h-px flex-1 bg-[var(--color-border)]" />
                        <span>{groupName}</span>
                        <span className="h-px flex-1 bg-[var(--color-border)]" />
                      </h2>
                    ) : null}
                    <ul className="space-y-3">
                      {items.map((item) => {
                        const fileType = formatResourceFileType(item.mimeType);
                        const fileSize = formatResourceFileSize(item.fileSize);
                        return (
                          <li key={item.id}>
                            <a
                              href={item.downloadHref}
                              className="group flex flex-col gap-3 rounded-[16px] border border-[var(--color-border)] bg-white p-4 transition hover:border-[color-mix(in_srgb,var(--color-primary-700)_35%,var(--color-border))] hover:shadow-[0_10px_28px_rgba(23,35,29,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-primary-100)] text-[11px] font-bold text-[var(--color-primary-900)]">
                                  {fileType ?? "DOC"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary-900)]">
                                    {item.title}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {item.category ? (
                                      <span className="rounded-md bg-[var(--color-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                                        {item.category}
                                      </span>
                                    ) : null}
                                    {item.version ? (
                                      <span className="rounded-md bg-[var(--color-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                                        {t.version}: {item.version}
                                      </span>
                                    ) : null}
                                    {fileSize ? (
                                      <span className="rounded-md bg-[var(--color-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                                        {fileSize}
                                      </span>
                                    ) : null}
                                    {item.publishedAt ? (
                                      <span className="rounded-md bg-[var(--color-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                                        {formatDate(item.publishedAt)}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                              <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-semibold text-white transition group-hover:bg-[var(--color-primary-700)]">
                                <DownloadIcon className="h-4 w-4" />
                                {t.download}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-[linear-gradient(160deg,var(--color-primary-100)_0%,white_55%)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
                {t.eyebrow}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {t.asideTitle}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {t.asideBody}
              </p>
              <ul className="mt-4 space-y-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                <li>{t.asideTip1}</li>
                <li>{t.asideTip2}</li>
                <li>{t.asideTip3}</li>
              </ul>
            </div>

            <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
              <div className="flex flex-col gap-2">
                <Link
                  href={routes.membership.apply}
                  className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
                >
                  {t.applyCta}
                </Link>
                <Link
                  href={routes.contact}
                  className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
                >
                  {t.contactCta}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
