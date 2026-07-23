import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Çerez Politikası" };

export default function CookiesPage() {
  return (
    <PagePlaceholder
      title="Çerez Politikası"
      description="Çerez politikası metni bu sayfada yayınlanacaktır."
      breadcrumbs={[{ label: "Çerez Politikası" }]}
    />
  );
}
