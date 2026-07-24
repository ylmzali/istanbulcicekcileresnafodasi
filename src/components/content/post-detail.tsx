import Image from "next/image";
import Link from "next/link";
import { PostDetailActions } from "@/components/content/post-detail-actions";
import { RichTextContent } from "@/components/content/post-list";
import { PostTypeBadge } from "@/components/home/news-section";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { Post } from "@/generated/prisma/client";
import { postHref, postListHref } from "@/lib/content-paths";
import { estimateReadingMinutes, formatDate } from "@/lib/datetime";
import { getMessages, t } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import {
  getAdjacentPublishedPosts,
  listRelatedPublishedPosts,
} from "@/services/posts";

export async function PostDetailView({ post }: { post: Post }) {
  const messages = getMessages();
  const listHref = postListHref(post.type);
  const listLabel =
    post.type === "announcement"
      ? messages.news.announcementsTitle
      : post.type === "news"
        ? messages.news.tabs.chamber
        : messages.news.tabs.sector;

  const breadcrumbs =
    post.type === "announcement"
      ? [
          { label: listLabel, href: listHref },
          { label: post.title },
        ]
      : [
          { label: messages.news.listTitle, href: postListHref("all") },
          { label: listLabel, href: listHref },
          { label: post.title },
        ];

  const [related, adjacent] = await Promise.all([
    listRelatedPublishedPosts(post.id, post.type, 5),
    getAdjacentPublishedPosts(post.id, post.type, post.publishedAt),
  ]);
  const sidebarRelated = related.slice(0, 4);
  const continueReading = related.slice(0, 3);
  const publishedLabel = formatDate(post.publishedAt);
  const readingMinutes = estimateReadingMinutes(post.excerpt, post.content);
  const readingLabel = t(messages, "news.readingTime", {
    minutes: readingMinutes,
  });

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");
  const detailUrl = `${baseUrl}${postHref(post.type, post.slug)}`;
  const logoSrc =
    typeof siteConfig.logo.src === "string"
      ? siteConfig.logo.src
      : siteConfig.logo.src.src;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt || post.seoDescription || undefined,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: detailUrl,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: logoSrc.startsWith("http") ? logoSrc : `${baseUrl}${logoSrc}`,
      },
    },
  };

  return (
    <div className="relative bg-[var(--color-surface-soft)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(90%_60%_at_12%_0%,color-mix(in_srgb,var(--color-primary-100)_85%,transparent),transparent_70%)] print:hidden"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumb items={breadcrumbs} className="mb-7 print:hidden" />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-12">
          <div className="min-w-0 space-y-5">
            <div className="post-print-root space-y-5">
              {post.coverImage ? (
                <figure className="relative aspect-[16/9] overflow-hidden rounded-[22px] bg-[var(--color-primary-100)] shadow-[0_1px_0_rgba(23,35,29,0.04),0_16px_40px_rgba(23,35,29,0.06)] ring-1 ring-[var(--color-border)] print:aspect-auto print:max-h-[280px] print:rounded-none print:shadow-none print:ring-0">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 900px"
                    className="object-cover print:static print:h-auto print:max-h-[280px] print:w-full print:object-contain"
                    priority
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,61,40,0.06)_0%,transparent_40%,rgba(11,61,40,0.16)_100%)] print:hidden"
                  />
                </figure>
              ) : null}

              <article className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(23,35,29,0.04),0_20px_48px_rgba(23,35,29,0.06)] ring-1 ring-[var(--color-border)] print:rounded-none print:bg-transparent print:shadow-none print:ring-0">
                <div className="px-5 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12 print:p-0">
                  <header>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-2 text-[13px] text-[var(--color-text-muted)]">
                        <span className="print:hidden">
                          <PostTypeBadge type={post.type} />
                        </span>
                        {post.publishedAt ? (
                          <>
                            <span
                              aria-hidden
                              className="text-[var(--color-border)] print:hidden"
                            >
                              ·
                            </span>
                            <time dateTime={post.publishedAt.toISOString()}>
                              {publishedLabel}
                            </time>
                          </>
                        ) : null}
                        <span
                          aria-hidden
                          className="text-[var(--color-border)] print:hidden"
                        >
                          ·
                        </span>
                        <span className="print:hidden">{readingLabel}</span>
                      </div>
                      <PostDetailActions
                        compact
                        className="ml-auto shrink-0 print:hidden"
                      />
                    </div>

                    <h1 className="mt-5 text-balance text-[1.85rem] font-bold tracking-[-0.025em] text-[var(--color-primary-900)] sm:text-[2.5rem] sm:leading-[1.15] print:mt-3 print:text-2xl">
                      {post.title}
                    </h1>

                    {post.excerpt ? (
                      <p className="mt-5 text-[1.05rem] leading-8 text-[var(--color-text-muted)] sm:text-[1.125rem] sm:leading-8 print:mt-3 print:text-base">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </header>

                  <div className="mt-9 print:mt-6">
                    {post.content ? (
                      <RichTextContent
                        content={post.content}
                        variant="article"
                      />
                    ) : (
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {messages.news.empty}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            </div>

            {(adjacent.previous || adjacent.next) && (
              <nav
                aria-label="İçerik gezintisi"
                className="grid gap-3 print:hidden sm:grid-cols-2"
              >
                {adjacent.previous ? (
                  <Link
                    href={postHref(
                      adjacent.previous.type,
                      adjacent.previous.slug,
                    )}
                    className="group flex min-h-[5.5rem] flex-col justify-center rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-3 transition hover:border-[var(--color-primary-100)]"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                      <ChevronLeftIcon className="h-3.5 w-3.5" />
                      {messages.news.previousPost}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary-800)]">
                      {adjacent.previous.title}
                    </span>
                  </Link>
                ) : (
                  <div className="hidden sm:block" />
                )}
                {adjacent.next ? (
                  <Link
                    href={postHref(adjacent.next.type, adjacent.next.slug)}
                    className="group flex min-h-[5.5rem] flex-col justify-center rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-3 text-right transition hover:border-[var(--color-primary-100)] sm:items-end"
                  >
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                      {messages.news.nextPost}
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary-800)]">
                      {adjacent.next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            )}

            <footer className="print:hidden">
              <Link
                href={listHref}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-900)] transition hover:border-[var(--color-primary-100)] hover:bg-[var(--color-primary-100)]"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                {messages.news.backToList}
              </Link>
            </footer>
          </div>

          <aside className="space-y-5 print:hidden lg:sticky lg:top-28 lg:self-start">
            {sidebarRelated.length > 0 ? (
              <div className="rounded-[18px] border border-[var(--color-border)] bg-white/90 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
                    {messages.news.related}
                  </p>
                  <Link
                    href={listHref}
                    className="text-xs font-semibold text-[var(--color-primary-800)] hover:underline"
                  >
                    {messages.news.viewAll}
                  </Link>
                </div>
                <ol className="mt-4 space-y-4">
                  {sidebarRelated.map((item, index) => (
                    <li key={item.id}>
                      <Link
                        href={postHref(item.type, item.slug)}
                        className="group flex gap-3"
                      >
                        <span
                          aria-hidden
                          className="mt-0.5 w-5 shrink-0 text-[13px] font-semibold tabular-nums text-[var(--color-primary-100)] group-hover:text-[var(--color-primary-700)]"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          {item.publishedAt ? (
                            <time
                              dateTime={item.publishedAt.toISOString()}
                              className="text-[11px] text-[var(--color-text-muted)]"
                            >
                              {formatDate(item.publishedAt)}
                            </time>
                          ) : null}
                          <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary-800)]">
                            {item.title}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[18px] bg-[var(--color-primary-900)] text-white">
              <div className="border-l-[3px] border-[color-mix(in_srgb,white_35%,transparent)] px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  {listLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/88">
                  {post.type === "announcement"
                    ? messages.news.announcementsDescription
                    : post.type === "news"
                      ? messages.news.chamberDescription
                      : messages.news.sectorDescription}
                </p>
                <Link
                  href={listHref}
                  className="mt-4 inline-flex h-10 items-center rounded-[10px] bg-white px-4 text-sm font-semibold text-[var(--color-primary-900)] transition hover:bg-[var(--color-primary-100)]"
                >
                  {messages.news.viewAll} →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {continueReading.length > 0 ? (
          <section className="mt-14 print:hidden">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
                  {listLabel}
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--color-primary-900)] sm:text-2xl">
                  {messages.news.continueReading}
                </h2>
              </div>
              <Link
                href={listHref}
                className="hidden text-sm font-semibold text-[var(--color-primary-800)] hover:underline sm:inline"
              >
                {messages.news.viewAll} →
              </Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-3">
              {continueReading.map((item) => (
                <li key={item.id}>
                  <Link
                    href={postHref(item.type, item.slug)}
                    className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-white ring-1 ring-[var(--color-border)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(23,35,29,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <div className="relative aspect-[16/9] bg-[var(--color-primary-100)]">
                      {item.coverImage ? (
                        <Image
                          src={item.coverImage}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <PostTypeBadge type={item.type} />
                        {item.publishedAt ? (
                          <time
                            dateTime={item.publishedAt.toISOString()}
                            className="text-[11px] text-[var(--color-text-muted)]"
                          >
                            {formatDate(item.publishedAt)}
                          </time>
                        ) : null}
                      </div>
                      <p className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-primary-800)]">
                        {item.title}
                      </p>
                      {item.excerpt ? (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
                          {item.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
