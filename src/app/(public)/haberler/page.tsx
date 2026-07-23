import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Haberler" };

export default function NewsPage() {
  return (
    <PagePlaceholder
      title="Haberler"
      description="Oda haberleri ve duyurular yayın akışına alındığında burada görünecektir."
      breadcrumbs={[{ label: "Haberler" }]}
    />
  );
}
