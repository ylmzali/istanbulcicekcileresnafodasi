import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DuesAssessButton,
  DuesSyncOpenButton,
} from "@/components/admin/dues-assess-button";
import { DuesPeriodForm } from "@/components/admin/dues-period-form";
import {
  AdminFormCard,
  AdminPageHeader,
} from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import {
  getDuesPeriodById,
  serializePeriodForForm,
} from "@/services/dues";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Aidat Dönemi",
  robots: { index: false, follow: false },
};

export default async function AdminEditDuesPeriodPage({ params }: PageProps) {
  const { id } = await params;
  const period = await getDuesPeriodById(id);
  if (!period) notFound();

  const a = getMessages().admin;
  const values = serializePeriodForForm(period);

  return (
    <div className="space-y-4">
      <AdminPageHeader title={a.edit} description={period.title} />
      <DuesPeriodForm
        values={values}
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
      <AdminFormCard className="space-y-5">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
            {a.duesAssess}
          </h2>
          <p className="mb-3 text-xs text-[var(--color-text-muted)]">
            Mevcut tahakkuk: {period._count.memberDues} kayıt
          </p>
          <DuesAssessButton
            periodId={period.id}
            labels={{
              label: a.duesAssess,
              hint: a.duesAssessHint,
              confirmTitle: a.duesAssessConfirmTitle,
              confirmMessage: a.duesAssessConfirmMessage,
              confirmLabel: a.duesAssessConfirm,
              cancelLabel: a.deleteCancel,
            }}
          />
        </div>
        <div className="border-t border-[var(--color-border)] pt-5">
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
            {a.duesSyncOpen}
          </h2>
          <DuesSyncOpenButton
            periodId={period.id}
            labels={{
              label: a.duesSyncOpen,
              hint: a.duesSyncOpenHint,
              confirmTitle: a.duesSyncOpenConfirmTitle,
              confirmMessage: a.duesSyncOpenConfirmMessage,
              confirmLabel: a.duesSyncOpenConfirm,
              cancelLabel: a.deleteCancel,
            }}
          />
        </div>
      </AdminFormCard>
    </div>
  );
}
