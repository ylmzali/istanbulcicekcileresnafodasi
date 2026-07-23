import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Başkanın Mesajı" };

export default function PresidentMessagePage() {
  return (
    <PagePlaceholder
      title="Başkanın Mesajı"
      description="Başkanın mesajı içeriği yönetim panelinden yayınlandığında burada yer alacaktır."
    />
  );
}
