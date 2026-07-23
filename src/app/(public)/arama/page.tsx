import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Arama" };

export default function SearchPage() {
  return (
    <PagePlaceholder
      title="Site İçi Arama"
      description="Arama altyapısı içerik yönetimiyle birlikte tamamlanacaktır."
      breadcrumbs={[{ label: "Arama" }]}
    />
  );
}
