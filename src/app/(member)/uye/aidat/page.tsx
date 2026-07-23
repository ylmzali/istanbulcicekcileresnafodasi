import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/lib/routes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aidat Sorgula" };

export default function MemberDuesPage() {
  return (
    <PagePlaceholder
      title="Aidat Sorgula"
      description="Aidat sorgulama ve ödeme geçmişi üye girişi tamamlandığında burada açılacaktır."
      breadcrumbs={[
        { label: "Üye Girişi", href: routes.member.login },
        { label: "Aidat Sorgula" },
      ]}
    />
  );
}
