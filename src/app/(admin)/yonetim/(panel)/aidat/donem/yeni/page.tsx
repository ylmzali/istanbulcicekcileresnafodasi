import type { Metadata } from "next";
import { DuesPeriodForm } from "@/components/admin/dues-period-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { ANNUAL_PERIOD_KEY } from "@/services/dues";

export const metadata: Metadata = {
  title: "Yeni Aidat Dönemi",
  robots: { index: false, follow: false },
};

export default function AdminNewDuesPeriodPage() {
  const a = getMessages().admin;
  const year = new Date().getFullYear();

  return (
    <div>
      <AdminPageHeader title={a.duesPeriodNew} description={a.dues} />
      <DuesPeriodForm
        values={{
          year: String(year),
          period: ANNUAL_PERIOD_KEY,
          title: `${year} Yıllık Aidat`,
          dueDate: `${year}-12-31`,
          amount: "",
          active: true,
        }}
        labels={{
          year: a.duesPeriodYear,
          periodKey: a.duesPeriodKey,
          periodKeyHint: a.duesPeriodKeyHint,
          title: a.duesPeriodTitle,
          amount: a.duesPeriodAmount,
          dueDate: a.duesPeriodDueDate,
          active: a.duesPeriodActive,
          save: a.save,
          back: a.back,
        }}
      />
    </div>
  );
}
