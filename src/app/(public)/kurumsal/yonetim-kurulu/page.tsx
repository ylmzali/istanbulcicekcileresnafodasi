import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Yönetim Kurulu" };

export default function BoardPage() {
  return (
    <PagePlaceholder
      title="Yönetim Kurulu"
      description="Yönetim kurulu üyeleri ve görev dağılımı bu sayfada yayınlanacaktır."
    />
  );
}
