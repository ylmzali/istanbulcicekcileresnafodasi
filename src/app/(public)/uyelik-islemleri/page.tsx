import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Üyelik İşlemleri" };

export default function MembershipPage() {
  return (
    <PagePlaceholder
      title="Üyelik İşlemleri"
      description="Üyelik koşulları, başvuru adımları ve belge süreçleri bu sayfada yayınlanacaktır."
      breadcrumbs={[{ label: "Üyelik İşlemleri" }]}
    />
  );
}
