import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Eğitimler" };

export default function TrainingsPage() {
  return (
    <PagePlaceholder
      title="Eğitimler ve Etkinlikler"
      description="Yaklaşan eğitim ve etkinlik takvimi bu alanda yönetilecektir."
    />
  );
}
