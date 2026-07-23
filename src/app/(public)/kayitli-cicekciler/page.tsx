import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kayıtlı Çiçekçi Rehberi" };

export default function DirectoryPage() {
  return (
    <PagePlaceholder
      title="Kayıtlı Çiçekçi Rehberi"
      description="Yalnızca aktif, onaylı ve rehber yayın izni vermiş üyeler listelenecektir."
      breadcrumbs={[{ label: "Kayıtlı Çiçekçi Rehberi" }]}
    />
  );
}
