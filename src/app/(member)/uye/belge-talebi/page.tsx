import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/lib/routes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Belge Talebi" };

export default function MemberDocumentRequestPage() {
  return (
    <PagePlaceholder
      title="Belge Talebi"
      description="Belge talep süreci üye girişi tamamlandığında burada açılacaktır."
      breadcrumbs={[
        { label: "Üye Girişi", href: routes.member.login },
        { label: "Belge Talebi" },
      ]}
    />
  );
}
