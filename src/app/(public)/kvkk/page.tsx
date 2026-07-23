import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

export default function KvkkPage() {
  return (
    <PagePlaceholder
      title="KVKK Aydınlatma Metni"
      description="Kişisel verilerin korunması aydınlatma metni bu sayfada yayınlanacaktır."
      breadcrumbs={[{ label: "KVKK Aydınlatma Metni" }]}
    />
  );
}
