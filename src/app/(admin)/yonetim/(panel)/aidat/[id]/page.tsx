import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DuesCollectForm } from "@/components/admin/dues-collect-form";
import {
  AdminFormCard,
  AdminPageHeader,
  StatusBadge,
} from "@/components/admin/form-fields";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { formatMoney, remainingDueAmount } from "@/lib/money";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { getMemberDueById } from "@/services/dues";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Aidat Detayı",
  robots: { index: false, follow: false },
};

export default async function AdminDueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const due = await getMemberDueById(id);
  if (!due) notFound();

  const a = getMessages().admin;
  const remaining = remainingDueAmount(due);
  const remainingLabel = formatMoney(remaining);
  const memberName = due.member.profile
    ? `${due.member.profile.firstName} ${due.member.profile.lastName}`.trim()
    : due.member.memberNo;
  const canCollect =
    due.status !== "paid" &&
    due.status !== "waived" &&
    remaining.greaterThan(0);
  const canWaive =
    due.status !== "waived" &&
    due.status !== "paid" &&
    Number(due.paidAmount.toString()) === 0;
  const canUnwaive = due.status === "waived";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={due.period.title}
        description={`${memberName} · ${due.member.memberNo}`}
        actions={
          <Link
            href={routes.admin.memberEdit(due.member.id)}
            className="text-sm font-medium text-[var(--color-primary-800)] hover:underline"
          >
            {a.members}
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFormCard className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              {a.duesRecords}
            </h2>
            <StatusBadge label={a.duesStatuses[due.status]} />
          </div>
          <dl className="grid gap-2 text-sm">
            <Row label={a.duesAssessed} value={formatMoney(due.assessedAmount)} />
            <Row label={a.duesPaid} value={formatMoney(due.paidAmount)} />
            <Row label={a.duesRemaining} value={remainingLabel} />
            <Row
              label={a.duesPeriodDueDate}
              value={formatDate(due.period.dueDate)}
            />
            <Row
              label={a.duesCollectionRef}
              value={due.member.collectionRef || "—"}
            />
          </dl>
        </AdminFormCard>

        <DuesCollectForm
          dueId={due.id}
          remainingLabel={remainingLabel}
          canCollect={canCollect}
          canWaive={canWaive}
          canUnwaive={canUnwaive}
          labels={{
            collect: a.duesCollect,
            amount: a.duesPeriodAmount,
            method: a.duesMethod,
            methods: a.duesMethods,
            providerReference: a.duesProviderReference,
            note: a.duesNote,
            paidAt: a.duesPaidAt,
            waive: a.duesWaive,
            waiveConfirmTitle: a.duesWaiveConfirmTitle,
            waiveConfirmMessage: a.duesWaiveConfirmMessage,
            waiveConfirm: a.duesWaiveConfirm,
            unwaive: a.duesUnwaive,
            unwaiveConfirmTitle: a.duesUnwaiveConfirmTitle,
            unwaiveConfirmMessage: a.duesUnwaiveConfirmMessage,
            unwaiveConfirm: a.duesUnwaiveConfirm,
            cancel: a.deleteCancel,
            remainingHint: a.duesRemaining,
            waivedNote: a.duesWaivedNote,
          }}
        />
      </div>

      <AdminFormCard className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {a.duesPayments}
        </h2>
        {due.allocations.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">{a.empty}</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {due.allocations.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {formatMoney(item.amount)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {a.duesMethods[
                      item.payment.method as keyof typeof a.duesMethods
                    ] ?? item.payment.method}
                    {item.payment.paidAt
                      ? ` · ${formatDateTime(item.payment.paidAt)}`
                      : ""}
                    {item.payment.receipt
                      ? ` · ${a.duesReceiptNo}: ${item.payment.receipt.receiptNo}`
                      : ""}
                  </p>
                  {item.payment.note ? (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {item.payment.note}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminFormCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}
