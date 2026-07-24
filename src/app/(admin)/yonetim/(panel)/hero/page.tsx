import type { Metadata } from "next";
import Link from "next/link";
import { BannersDataTable } from "@/components/admin/banners-data-table";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { listBannerSortIds, listBanners } from "@/services/banners";

export const metadata: Metadata = {
  title: "Hero Slaytları",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBannersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q");
  const activeRaw = getSearchParam(params, "active");
  const active =
    activeRaw === "1" ? true : activeRaw === "0" ? false : undefined;

  const [result, orderedIds] = await Promise.all([
    listBanners({
      q: q || undefined,
      active,
      page: tableQuery.page,
      pageSize: tableQuery.pageSize,
    }),
    listBannerSortIds(),
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={a.banners}
        description="Ana sayfa hero alanı slaytları. Haberlerden bağımsız yönetilir."
        actions={
          <Link href={routes.admin.bannerNew}>
            <Button size="sm">{a.newItem}</Button>
          </Link>
        }
      />

      <BannersDataTable
        rows={result.rows.map((banner) => {
          const globalIndex = orderedIds.indexOf(banner.id);
          return {
            id: banner.id,
            title: banner.title,
            variantLabel: a.bannerVariants[banner.variant],
            sortOrder: banner.sortOrder,
            active: banner.active,
            canMoveUp: globalIndex > 0,
            canMoveDown:
              globalIndex >= 0 && globalIndex < orderedIds.length - 1,
          };
        })}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        query={{ q, active: activeRaw }}
        labels={{
          search: a.search,
          all: a.filterAll,
          empty: a.empty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          title: a.title,
          variant: a.variant,
          sortOrder: a.sortOrder,
          status: a.status,
          active: a.active,
          edit: a.edit,
          moveUp: "Yukarı taşı",
          moveDown: "Aşağı taşı",
        }}
        activeOptions={[
          { value: "1", label: a.active },
          { value: "0", label: "Pasif" },
        ]}
      />
    </div>
  );
}
