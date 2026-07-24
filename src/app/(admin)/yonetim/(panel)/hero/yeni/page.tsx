import type { Metadata } from "next";
import { BannerForm } from "@/components/admin/banner-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Yeni Hero Slaytı",
  robots: { index: false, follow: false },
};

export default function AdminNewBannerPage() {
  const a = getMessages().admin;
  const upload = getAdminUploadLabels();

  return (
    <div>
      <AdminPageHeader title={a.newItem} description={a.banners} />
      <BannerForm
        values={{
          variant: "text_cta",
          eyebrow: "",
          title: "",
          description: "",
          imageKey: "",
          mobileImageKey: "",
          primaryCtaLabel: "",
          primaryCtaHref: "",
          primaryCtaNewTab: false,
          secondaryCtaLabel: "",
          secondaryCtaHref: "",
          secondaryCtaNewTab: false,
          sortOrder: "0",
          active: true,
          startsAt: "",
          endsAt: "",
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
