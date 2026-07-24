import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BannerForm } from "@/components/admin/banner-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getMessages } from "@/lib/i18n";
import { getBannerById } from "@/services/banners";

export const metadata: Metadata = {
  title: "Hero Slaytı Düzenle",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditBannerPage({ params }: PageProps) {
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) notFound();

  const a = getMessages().admin;
  const upload = getAdminUploadLabels();

  return (
    <div>
      <AdminPageHeader title={a.edit} description={banner.title} />
      <BannerForm
        values={{
          id: banner.id,
          variant: banner.variant,
          eyebrow: banner.eyebrow ?? "",
          title: banner.title,
          description: banner.description ?? "",
          imageKey: banner.imageKey ?? "",
          mobileImageKey: banner.mobileImageKey ?? "",
          primaryCtaLabel: banner.primaryCtaLabel ?? "",
          primaryCtaHref: banner.primaryCtaHref ?? "",
          primaryCtaNewTab: banner.primaryCtaNewTab,
          secondaryCtaLabel: banner.secondaryCtaLabel ?? "",
          secondaryCtaHref: banner.secondaryCtaHref ?? "",
          secondaryCtaNewTab: banner.secondaryCtaNewTab,
          sortOrder: String(banner.sortOrder),
          active: banner.active,
          startsAt: banner.startsAt?.toISOString() ?? "",
          endsAt: banner.endsAt?.toISOString() ?? "",
        }}
        labels={{
          variant: a.variant,
          eyebrow: a.eyebrow,
          title: a.title,
          descriptionField: a.descriptionField,
          primaryCtaLabel: a.primaryCtaLabel,
          primaryCtaHref: a.primaryCtaHref,
          primaryCtaNewTab: a.primaryCtaNewTab,
          secondaryCtaLabel: a.secondaryCtaLabel,
          secondaryCtaHref: a.secondaryCtaHref,
          secondaryCtaNewTab: a.secondaryCtaNewTab,
          imageDesktop: a.imageDesktop,
          imageMobile: a.imageMobile,
          linkHref: a.linkHref,
          linkNewTab: a.linkNewTab,
          sortOrder: a.sortOrder,
          active: a.active,
          startsAt: a.startsAt,
          endsAt: a.endsAt,
          save: a.save,
          delete: a.delete,
          back: a.back,
          ...upload,
          bannerVariants: a.bannerVariants,
        }}
      />
    </div>
  );
}
