import Image from "next/image";
import Link from "next/link";
import type { PostType } from "@/generated/prisma/client";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumb";
import { PostTypeBadge } from "@/components/home/news-section";
import { postHref } from "@/lib/content-paths";
import { formatDate } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type PublicPostCard = {
  id: string;
  type: PostType;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
};

export function ContentPageHeader({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <div className="mb-8">
      <Breadcrumb items={breadcrumbs} />
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary-900)] sm:text-[2.35rem]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-[15px] text-[var(--color-text-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PostCard({ post }: { post: PublicPostCard }) {
  const messages = getMessages();
  const href = postHref(post.type, post.slug);

  return (
    <article className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-white transition hover:border-[var(--color-primary-100)]">
      <Link href={href} className="block">
        <div className="relative aspect-[16/9] bg-[var(--color-primary-100)]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <PostTypeBadge type={post.type} />
            {post.publishedAt ? (
              <time
                dateTime={post.publishedAt.toISOString()}
                className="text-xs text-[var(--color-text-muted)]"
              >
                {formatDate(post.publishedAt)}
              </time>
            ) : null}
          </div>
          <h2 className="text-base font-bold leading-snug text-[var(--color-text)]">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">
              {post.excerpt}
            </p>
          ) : null}
          <span className="inline-flex text-sm font-semibold text-[var(--color-primary-800)]">
            {messages.news.details} →
          </span>
        </div>
      </Link>
    </article>
  );
}

export function PostListGrid({ posts }: { posts: PublicPostCard[] }) {
  const messages = getMessages();
  if (posts.length === 0) {
    return (
      <p className="rounded-[18px] border border-dashed border-[var(--color-border)] bg-white px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
        {messages.news.empty}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export function ContentFilterTabs({
  items,
  activeHref,
}: {
  items: Array<{ href: string; label: string }>;
  activeHref: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--color-primary-800)] text-white"
                : "bg-white text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-primary-100)]",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  makeHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Sayfalama"
      className="mt-8 flex items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={makeHref(page - 1)}
          className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm font-medium"
        >
          Önceki
        </Link>
      ) : null}
      <span className="text-sm text-[var(--color-text-muted)]">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={makeHref(page + 1)}
          className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm font-medium"
        >
          Sonraki
        </Link>
      ) : null}
    </nav>
  );
}

export function RichTextContent({
  content,
  variant = "default",
}: {
  content: string;
  variant?: "default" | "article";
}) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div
      className={cn(
        "text-[var(--color-text)]",
        variant === "article"
          ? "space-y-6 text-[17px] leading-[1.8] tracking-[-0.01em]"
          : "space-y-5 text-[15px] leading-7 sm:text-base sm:leading-8",
      )}
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={`${index}-${paragraph.slice(0, 32)}`}
          className="whitespace-pre-wrap"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
