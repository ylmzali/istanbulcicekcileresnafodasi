import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Evrak Doğrulama" };

export default function DocumentVerificationPage() {
  return (
    <PagePlaceholder
      title="Evrak Doğrulama"
      description="Belge numarası ve doğrulama kodu ile sorgulama sonraki fazda eklenecektir."
    />
  );
}
