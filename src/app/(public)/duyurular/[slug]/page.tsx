import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/lib/routes";
import { isValidSlug } from "@/lib/slug";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type AnnouncementDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: AnnouncementDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: isValidSlug(slug) ? `Duyuru · ${slug}` : "Duyuru" };
}

export default async function AnnouncementDetailPage({
  params,
}: AnnouncementDetailPageProps) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  return (
    <PagePlaceholder
      title="Duyuru detayı"
      description={`Bu duyuru sayfası hazırlanıyor. Slug: ${slug}`}
      breadcrumbs={[
        { label: "Duyurular", href: routes.announcements.root },
        { label: slug },
      ]}
    />
  );
}
