import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { ResourcesDataTable } from "@/components/admin/resources-data-table";
import { Button } from "@/components/ui/button";
import type { ResourceVisibility } from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { formatDate } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import {
  listResources,
  resourceVisibilitySchema,
} from "@/services/resources";

export const metadata: Metadata = {
  title: "Mevzuat / Kaynaklar",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q");
  const visibilityRaw = getSearchParam(params, "visibility");
  const visibility = resourceVisibilitySchema.safeParse(visibilityRaw).success
    ? (visibilityRaw as ResourceVisibility)
    : undefined;

  const result = await listResources({
    q: q || undefined,
    visibility,
    page: tableQuery.page,
    pageSize: tableQuery.pageSize,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={a.resources}
        description={a.resourcesDescription}
        actions={
          <Link href={routes.admin.resourceNew}>
            <Button size="sm">{a.newItem}</Button>
          </Link>
        }
      />

      <ResourcesDataTable
        rows={result.rows.map((row) => ({
          id: row.id,
          title: row.title,
          categoryLabel: row.category ?? "—",
          versionLabel: row.version ?? "—",
          visibility: row.visibility,
          visibilityLabel: a.resourceVisibilities[row.visibility],
          sortOrder: row.sortOrder,
          publishedAtLabel: formatDate(row.publishedAt),
        }))}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        query={{ q, visibility: visibilityRaw }}
        labels={{
          search: a.search,
          all: a.filterAll,
          empty: a.empty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          title: a.title,
          category: a.category,
          version: a.resourceVersion,
          visibility: a.resourceVisibility,
          sortOrder: a.sortOrder,
          publishedAt: a.publishedAt,
          edit: a.edit,
        }}
        visibilityOptions={Object.entries(a.resourceVisibilities).map(
          ([value, label]) => ({ value, label }),
        )}
      />
    </div>
  );
}
