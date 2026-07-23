import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aidat Sorgula" };

export default function MemberDuesPage() {
  return (
    <PagePlaceholder
      title="Aidat Sorgula"
      description="Aidat sorgulama ve ödeme geçmişi üye girişi tamamlandığında burada açılacaktır."
    />
  );
}
