import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/lib/routes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Online Randevu" };

export default function MemberAppointmentPage() {
  return (
    <PagePlaceholder
      title="Online Randevu"
      description="Randevu alma süreci üye girişi tamamlandığında burada açılacaktır."
      breadcrumbs={[
        { label: "Üye Girişi", href: routes.member.login },
        { label: "Online Randevu" },
      ]}
    />
  );
}
