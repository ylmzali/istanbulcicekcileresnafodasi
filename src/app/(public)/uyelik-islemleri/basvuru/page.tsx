import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/lib/routes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Üyelik Başvurusu" };

export default function MembershipApplicationPage() {
  return (
    <PagePlaceholder
      title="Üyelik Başvurusu"
      description="Oda kayıt başvuru formu ve belge yükleme akışı sonraki fazda eklenecektir."
      breadcrumbs={[
        { label: "Üyelik İşlemleri", href: routes.membership.root },
        { label: "Üyelik Başvurusu" },
      ]}
    />
  );
}
