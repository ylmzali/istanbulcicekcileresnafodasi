import {
  ContentFilterTabs,
  ContentPageHeader,
  Pagination,
  PostListGrid,
} from "@/components/content/post-list";
import type { PostType } from "@/generated/prisma/client";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { listPublishedPosts } from "@/services/posts";

export type PostsBrowseFilter = "all" | PostType;

function filterToType(
  filter: PostsBrowseFilter,
): PostType | PostType[] | undefined {
  if (filter === "all") return undefined;
  return filter;
}

function filterHref(filter: PostsBrowseFilter) {
  if (filter === "announcement") return routes.announcements.root;
  if (filter === "news") return routes.news.chamber;
  if (filter === "sector") return routes.news.sector;
  return routes.news.root;
}

function filterTitle(
  filter: PostsBrowseFilter,
  messages: ReturnType<typeof getMessages>,
) {
  if (filter === "announcement") return messages.news.announcementsTitle;
  if (filter === "news") return messages.news.tabs.chamber;
  if (filter === "sector") return messages.news.tabs.sector;
  return messages.news.listTitle;
}

function filterDescription(
  filter: PostsBrowseFilter,
  messages: ReturnType<typeof getMessages>,
) {
  if (filter === "announcement") {
    return messages.news.announcementsDescription;
  }
  if (filter === "news") return messages.news.chamberDescription;
  if (filter === "sector") return messages.news.sectorDescription;
  return messages.news.listDescription;
}

export async function PostsBrowsePage({
  filter,
  page,
}: {
  filter: PostsBrowseFilter;
  page: number;
}) {
  const messages = getMessages();
  const result = await listPublishedPosts({
    type: filterToType(filter),
    page,
    pageSize: 12,
  });

  const activeHref = filterHref(filter);
  const title = filterTitle(filter, messages);
  const description = filterDescription(filter, messages);

  const filters = [
    { href: routes.news.root, label: messages.news.tabs.all },
    {
      href: routes.announcements.root,
      label: messages.news.tabs.announcements,
    },
    { href: routes.news.chamber, label: messages.news.tabs.chamber },
    { href: routes.news.sector, label: messages.news.tabs.sector },
  ];

  const breadcrumbs =
    filter === "all" || filter === "announcement"
      ? [{ label: title }]
      : [
          { label: messages.news.listTitle, href: routes.news.root },
          { label: title },
        ];

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12">
        <ContentPageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
        />
        <ContentFilterTabs items={filters} activeHref={activeHref} />
        <PostListGrid posts={result.rows} />
        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          makeHref={(nextPage) => {
            const base = activeHref;
            return nextPage > 1 ? `${base}?page=${nextPage}` : base;
          }}
        />
      </div>
    </div>
  );
}
