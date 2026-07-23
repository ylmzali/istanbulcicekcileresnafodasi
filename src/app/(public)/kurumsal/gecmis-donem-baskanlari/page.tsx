import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Geçmiş Dönem Başkanları" };

export default function PastPresidentsPage() {
  return (
    <PagePlaceholder
      title="Geçmiş Dönem Başkanları"
      description="Geçmiş dönem başkanları listesi bu sayfada yayınlanacaktır."
    />
  );
}
