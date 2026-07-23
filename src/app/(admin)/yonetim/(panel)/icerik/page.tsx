import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { PostsDataTable } from "@/components/admin/posts-data-table";
import { Button } from "@/components/ui/button";
import type { ContentStatus, PostType } from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { listPosts, postTypeSchema, contentStatusSchema } from "@/services/posts";

export const metadata: Metadata = {
  title: "Haber & Duyuru",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q");
  const typeRaw = getSearchParam(params, "type");
  const statusRaw = getSearchParam(params, "status");
  const type = postTypeSchema.safeParse(typeRaw).success
    ? (typeRaw as PostType)
    : undefined;
  const status = contentStatusSchema.safeParse(statusRaw).success
    ? (statusRaw as ContentStatus)
    : undefined;

  const result = await listPosts({
    q: q || undefined,
    type,
    status,
    page: tableQuery.page,
    pageSize: tableQuery.pageSize,
  });

  const tableRows = result.rows.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    type: post.type,
    typeLabel: a.postTypes[post.type],
    status: post.status,
    statusLabel: a.statuses[post.status],
  }));

  return (
    <div>
      <AdminPageHeader
        title={a.posts}
        actions={
          <Link href={routes.admin.postNew}>
            <Button size="sm">{a.newItem}</Button>
          </Link>
        }
      />

      <PostsDataTable
        rows={tableRows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        query={{ q, type: typeRaw, status: statusRaw }}
        labels={{
          search: a.search,
          all: a.filterAll,
          empty: a.empty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          title: a.title,
          type: a.type,
          status: a.status,
          edit: a.edit,
        }}
        typeOptions={Object.entries(a.postTypes).map(([value, label]) => ({
          value,
          label,
        }))}
        statusOptions={Object.entries(a.statuses).map(([value, label]) => ({
          value,
          label,
        }))}
      />
    </div>
  );
}
