import type { Metadata } from "next";
import { PastPresidentsGrid } from "@/components/corporate/past-presidents-grid";
import { CorporatePageShell } from "@/components/corporate/corporate-page-shell";
import { pastPresidents } from "@/lib/corporate/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Geçmiş Dönem Başkanları",
  description:
    "İstanbul Çiçekçiler Esnaf Odası’nda geçmişten günümüze görev yapmış başkanlarımız.",
};

export default function PastPresidentsPage() {
  return (
    <CorporatePageShell
      title="Geçmiş Dönem Başkanları"
      description="İstanbul Çiçekçiler Esnaf Odası’nda geçmişten günümüze görev yapmış başkanlarımız."
      current={routes.corporate.pastPresidents}
      breadcrumbs={[
        { label: "Kurumsal", href: routes.corporate.root },
        { label: "Geçmiş Dönem Başkanları" },
      ]}
    >
      <PastPresidentsGrid presidents={pastPresidents} />
    </CorporatePageShell>
  );
}
