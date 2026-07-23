import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dilek & Şikâyet" };

export default function ComplaintPage() {
  return (
    <PagePlaceholder
      title="Dilek & Şikâyet"
      description="Dilek ve şikâyet başvuru formu sonraki fazda eklenecektir."
      breadcrumbs={[{ label: "Dilek & Şikâyet" }]}
    />
  );
}
