import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Belge Talebi" };

export default function MemberDocumentRequestPage() {
  return (
    <PagePlaceholder
      title="Belge Talebi"
      description="Belge talep süreci üye girişi tamamlandığında burada açılacaktır."
    />
  );
}
