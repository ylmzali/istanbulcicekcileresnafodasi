"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import type { PostType } from "@/generated/prisma/client";
import { postHref } from "@/lib/content-paths";
import { formatDate } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import {
  type HomeNewsItemDto,
  type HomeNewsTab,
} from "@/lib/home-news";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type HomeNewsItem = HomeNewsItemDto;

const typeLabelKey = {
  news: "chamber",
  announcement: "announcements",
  sector: "sector",
} as const;

function typeBadgeClass(type: PostType) {
  if (type === "announcement") {
    return "bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] text-[var(--color-accent)]";
  }
  if (type === "sector") {
    return "bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]";
  }
  return "bg-[var(--color-primary-100)] text-[var(--color-primary-800)]";
}

function viewAllHref(tab: HomeNewsTab) {
  if (tab === "announcements") return routes.announcements.root;
  if (tab === "chamber") return routes.news.chamber;
  if (tab === "sector") return routes.news.sector;
  return routes.news.root;
}

function NewsFeed({
  items,
  labels,
}: {
  items: HomeNewsItem[];
  labels: {
    empty: string;
    details: string;
    tabs: {
      announcements: string;
      chamber: string;
      sector: string;
    };
  };
}) {
  if (items.length === 0) {
    return (
      <p className="mt-8 rounded-[16px] border border-dashed border-[var(--color-border)] bg-white px-4 py-14 text-center text-sm text-[var(--color-text-muted)]">
        {labels.empty}
      </p>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
      {items.slice(0, 4).map((item) => (
        <li key={item.id}>
          <article className="group h-full">
            <Link
              href={postHref(item.type, item.slug)}
              className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-700)] focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] bg-[linear-gradient(145deg,#0E5A39,#173528)] ring-1 ring-[var(--color-border)]">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]"
                  />
                )}
              </div>

              <div className="mt-3 flex min-h-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      typeBadgeClass(item.type),
                    )}
                  >
                    {labels.tabs[typeLabelKey[item.type]]}
                  </span>
                  {item.publishedAt ? (
                    <time
                      dateTime={item.publishedAt}
                      className="text-[11px] text-[var(--color-text-muted)]"
                    >
                      {formatDate(item.publishedAt)}
                    </time>
                  ) : null}
                </div>

                <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-[var(--color-text)] transition group-hover:text-[var(--color-primary-800)] sm:text-[15px]">
                  {item.title}
                </h3>

                {item.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-text-muted)] sm:text-[13px]">
                    {item.excerpt}
                  </p>
                ) : null}

                <span className="mt-auto pt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-800)] sm:text-sm">
                  {labels.details}
                  <span
                    aria-hidden
                    className="transition group-hover:translate-x-0.5 motion-reduce:transform-none"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function NewsSection({ items }: { items: HomeNewsItem[] }) {
  const messages = getMessages();
  const [tab, setTab] = useState<HomeNewsTab>("all");
  const [feed, setFeed] = useState(items);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cacheRef = useRef(new Map<HomeNewsTab, HomeNewsItem[]>([["all", items]]));
  const abortRef = useRef<AbortController | null>(null);

  const tabs = [
    { key: "all" as const, label: messages.news.tabs.all },
    {
      key: "announcements" as const,
      label: messages.news.tabs.announcements,
    },
    { key: "chamber" as const, label: messages.news.tabs.chamber },
    { key: "sector" as const, label: messages.news.tabs.sector },
  ];

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function selectTab(next: HomeNewsTab) {
    if (next === tab) return;
    setTab(next);
    setError(null);

    const cached = cacheRef.current.get(next);
    if (cached) {
      setFeed(cached);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/public/posts?tab=${next}&limit=4`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          },
        );
        const payload = (await response.json()) as {
          success?: boolean;
          data?: HomeNewsItem[];
          message?: string;
        };

        if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
          throw new Error(payload.message || messages.news.loadError);
        }

        cacheRef.current.set(next, payload.data);
        if (!controller.signal.aborted) {
          setFeed(payload.data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(messages.news.loadError);
        setFeed([]);
        void err;
      }
    });
  }

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] py-14 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-[var(--color-border)] pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-700)]">
              {messages.news.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-primary-900)] sm:text-3xl">
              {messages.news.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)] sm:text-[15px]">
              {messages.news.description}
            </p>
          </div>

          <Link
            href={viewAllHref(tab)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-800)] transition hover:border-[var(--color-primary-100)] hover:bg-[var(--color-primary-100)] lg:self-auto"
          >
            {messages.news.viewAll}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div
          className="mt-5 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={messages.news.title}
        >
          {tabs.map((item) => {
            const selected = item.key === tab;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectTab(item.key)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition",
                  selected
                    ? "border-[var(--color-primary-800)] text-[var(--color-primary-900)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-text)]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          aria-busy={pending}
          className={cn(pending ? "opacity-70 transition-opacity" : null)}
        >
          {pending && !cacheRef.current.has(tab) ? (
            <p className="mt-8 rounded-[16px] border border-dashed border-[var(--color-border)] bg-white px-4 py-14 text-center text-sm text-[var(--color-text-muted)]">
              {messages.news.loading}
            </p>
          ) : error ? (
            <p
              role="alert"
              className="mt-8 rounded-[16px] border border-dashed border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-white px-4 py-14 text-center text-sm text-[var(--color-accent)]"
            >
              {error}
            </p>
          ) : (
            <NewsFeed
              items={feed}
              labels={{
                empty: messages.news.empty,
                details: messages.news.details,
                tabs: messages.news.tabs,
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export function PostTypeBadge({
  type,
  className,
}: {
  type: PostType;
  className?: string;
}) {
  const messages = getMessages();
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
        typeBadgeClass(type),
        className,
      )}
    >
      {messages.news.tabs[typeLabelKey[type]]}
    </span>
  );
}
