import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SearchIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { searchPublicContent } from "@/services/search";

export const metadata: Metadata = {
  title: "Site İçi Arama",
  description: "Haber, duyuru ve sık sorulan sorularda arama yapın.",
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const t = getMessages().search;
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const result = q.length >= 2 ? await searchPublicContent(q) : null;

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[860px] px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumb items={[{ label: t.title }]} />
        <header className="mt-2 mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary-900)]">
            {t.title}
          </h1>
          <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">
            {t.description}
          </p>
        </header>

        <form
          action={routes.search}
          method="get"
          className="rounded-[18px] border border-[var(--color-border)] bg-white p-4 shadow-[0_12px_30px_rgba(23,35,29,0.04)] sm:p-5"
          role="search"
        >
          <label htmlFor="site-search-q" className="sr-only">
            {t.inputLabel}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                id="site-search-q"
                name="q"
                type="search"
                defaultValue={q}
                minLength={2}
                maxLength={80}
                required
                placeholder={t.placeholder}
                className="h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-white pr-3 pl-10 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white hover:bg-[var(--color-primary-700)]"
            >
              {t.submit}
            </button>
          </div>
        </form>

        <div className="mt-6">
          {!q ? (
            <p className="text-sm text-[var(--color-text-muted)]">{t.hint}</p>
          ) : q.length < 2 ? (
            <p className="text-sm text-[var(--color-text-muted)]">{t.minChars}</p>
          ) : result && result.counts.total === 0 ? (
            <p className="rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-5 text-sm text-[var(--color-text-muted)]">
              {t.empty.replace("{q}", result.q)}
            </p>
          ) : result ? (
            <>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                {t.results
                  .replace("{count}", String(result.counts.total))
                  .replace("{q}", result.q)}
              </p>
              <ul className="space-y-3">
                {result.items.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="block rounded-[16px] border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-primary-100)] hover:shadow-[0_10px_24px_rgba(23,35,29,0.05)]"
                    >
                      <p className="text-[11px] font-semibold tracking-wide text-[var(--color-primary-700)] uppercase">
                        {item.meta}
                      </p>
                      <h2 className="mt-1 text-base font-semibold text-[var(--color-text)]">
                        {item.title}
                      </h2>
                      {item.excerpt ? (
                        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                          {item.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
