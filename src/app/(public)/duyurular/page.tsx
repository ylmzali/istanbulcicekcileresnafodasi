import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Duyurular" };

export default function AnnouncementsPage() {
  return (
    <PagePlaceholder
      title="Duyurular"
      description="Oda duyuruları bu bölümde listelenecektir."
      breadcrumbs={[{ label: "Duyurular" }]}
    />
  );
}
