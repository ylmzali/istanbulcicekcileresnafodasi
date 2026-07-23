import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPage() {
  return (
    <PagePlaceholder
      title="Gizlilik Politikası"
      description="Gizlilik politikası metni bu sayfada yayınlanacaktır."
      breadcrumbs={[{ label: "Gizlilik Politikası" }]}
    />
  );
}
