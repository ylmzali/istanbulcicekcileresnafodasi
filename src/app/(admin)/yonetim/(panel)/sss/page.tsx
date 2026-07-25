import type { Metadata } from "next";
import Link from "next/link";
import { FaqCategoryForm } from "@/components/admin/faq-form";
import { AdminFormCard, AdminPageHeader } from "@/components/admin/form-fields";
import { FaqsDataTable } from "@/components/admin/faqs-data-table";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@/generated/prisma/client";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { listFaqCategories, listFaqs } from "@/services/faqs";
import { contentStatusSchema } from "@/services/posts";

export const metadata: Metadata = {
  title: "SSS",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminFaqsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q");
  const category = getSearchParam(params, "category");
  const statusRaw = getSearchParam(params, "status");
  const status = contentStatusSchema.safeParse(statusRaw).success
    ? (statusRaw as ContentStatus)
    : undefined;

  const [faqResult, categories] = await Promise.all([
    listFaqs({
      q: q || undefined,
      categoryId: category || undefined,
      status,
      page: tableQuery.page,
      pageSize: tableQuery.pageSize,
    }),
    listFaqCategories(),
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={a.faqs}
        actions={
          <Link href={routes.admin.faqNew}>
            <Button size="sm">{a.newItem}</Button>
          </Link>
        }
      />

      <AdminFormCard>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          {a.category}
        </h2>
        <FaqCategoryForm
          labels={{
            name: a.category,
            slug: a.slug,
            slugHint: a.slugHint,
            slugChecking: a.slugChecking,
            slugAvailable: a.slugAvailable,
            slugTaken: a.slugTaken,
            slugInvalid: a.slugInvalid,
            slugEmptyHint: a.slugEmptyHint,
            save: a.save,
          }}
        />
        {categories.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((item) => (
              <li
                key={item.id}
                className="rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]"
              >
                {item.name} ({item._count.faqs})
              </li>
            ))}
          </ul>
        ) : null}
      </AdminFormCard>

      <FaqsDataTable
        rows={faqResult.rows.map((faq) => ({
          id: faq.id,
          question: faq.question,
          categoryId: faq.categoryId ?? "",
          categoryLabel: faq.category?.name ?? "—",
          status: faq.status,
          statusLabel: a.statuses[faq.status],
        }))}
        total={faqResult.total}
        page={faqResult.page}
        pageSize={faqResult.pageSize}
        query={{ q, category, status: statusRaw }}
        labels={{
          search: a.search,
          all: a.filterAll,
          empty: a.empty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          question: a.question,
          category: a.category,
          status: a.status,
          edit: a.edit,
        }}
        categoryOptions={categories.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        statusOptions={Object.entries(a.statuses).map(([value, label]) => ({
          value,
          label,
        }))}
      />
    </div>
  );
}
