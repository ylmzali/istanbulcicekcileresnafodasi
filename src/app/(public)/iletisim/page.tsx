import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "İletişim" };

export default function ContactPage() {
  return (
    <PagePlaceholder
      title="İletişim"
      description={`${siteConfig.address} · ${siteConfig.phoneDisplay} · ${siteConfig.email}`}
      breadcrumbs={[{ label: "İletişim" }]}
    />
  );
}
