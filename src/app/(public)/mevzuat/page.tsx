import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mevzuat" };

export default function LegislationPage() {
  return (
    <PagePlaceholder
      title="Mevzuat"
      description="Kanun, yönetmelik ve indirilebilir kaynaklar CMS bağlandığında burada listelenecektir."
    />
  );
}
