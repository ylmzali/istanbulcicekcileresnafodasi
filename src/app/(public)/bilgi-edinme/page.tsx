import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bilgi Edinme" };

export default function InformationRequestPage() {
  return (
    <PagePlaceholder
      title="Bilgi Edinme"
      description="Bilgi edinme formu ve takip altyapısı sonraki fazda eklenecektir."
      breadcrumbs={[{ label: "Bilgi Edinme" }]}
    />
  );
}
