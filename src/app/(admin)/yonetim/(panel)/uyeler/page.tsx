import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { MembersDataTable } from "@/components/admin/members-data-table";
import { Button } from "@/components/ui/button";
import { getAdminMemberLabels } from "@/lib/admin-member-labels";
import { getSearchParam, parseAdminTableQuery } from "@/lib/admin-table";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Üyeler",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminMembersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const a = getMessages().admin;
  const labels = getAdminMemberLabels();
  const tableQuery = parseAdminTableQuery(params);
  const q = getSearchParam(params, "q") ?? "";
  const status = getSearchParam(params, "status") ?? "";

  return (
    <div>
      <AdminPageHeader
        title={a.members}
        description={a.membersDescription}
        actions={
          <Link href={routes.admin.memberNew}>
            <Button size="sm">{a.newItem}</Button>
          </Link>
        }
      />

      <MembersDataTable
        initialQuery={{
          q,
          status,
          page: tableQuery.page,
          pageSize: tableQuery.pageSize,
        }}
        labels={{
          search: a.search,
          all: a.filterAll,
          empty: a.empty,
          results: a.resultsCount,
          prev: a.prevPage,
          next: a.nextPage,
          apply: a.applyFilters,
          loading: getMessages().common.loading,
          loadError: getMessages().common.error,
          memberNo: labels.memberNo,
          fullName: labels.fullName,
          businessName: labels.businessName,
          district: labels.district,
          phone: labels.phone,
          status: labels.status,
          registeredAt: labels.registeredAt,
          edit: a.edit,
        }}
        statusOptions={Object.entries(a.memberStatuses).map(([value, label]) => ({
          value,
          label,
        }))}
      />
    </div>
  );
}
