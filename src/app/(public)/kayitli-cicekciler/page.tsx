import type { Metadata } from "next";
import { FloristDirectory } from "@/components/content/florist-directory";
import { ContentPageHeader } from "@/components/content/post-list";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { listPublicFlorists } from "@/services/directory";

export const metadata: Metadata = {
  title: "Kayıtlı Çiçekçi Rehberi",
  description:
    "İstanbul’daki odaya kayıtlı, aktif ve yayına izin vermiş çiçekçi işletmelerini bulun.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const messages = getMessages();
  const t = messages.directory;
  const params = await searchParams;
  const q = param(params, "q");
  const district = param(params, "district");

  const result = await listPublicFlorists({
    q: q || undefined,
    districtSlug: district || undefined,
    pageSize: 48,
  });

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
        <ContentPageHeader
          title={t.title}
          description={t.description}
          breadcrumbs={[
            { label: messages.nav.home, href: routes.home },
            { label: t.title },
          ]}
        />
        <p className="-mt-4 mb-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {t.eyebrow}
        </p>

        <FloristDirectory
          initialItems={result.items}
          initialTotal={result.total}
          initialQ={q}
          initialDistrict={district}
        />
      </div>
    </div>
  );
}
