import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { DueStatus } from "@/generated/prisma/client";
import { getMemberSession } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { getMemberDuesLedger } from "@/services/dues";

export const metadata: Metadata = {
  title: "Aidat",
  robots: { index: false, follow: false },
};

export default async function MemberDuesPage() {
  const session = await getMemberSession();
  if (!session) {
    redirect(routes.member.login);
  }

  const ledger = await getMemberDuesLedger(session.memberId);
  if (!ledger) {
    redirect(routes.member.login);
  }

  const t = getMessages().memberPortal.dues;

  return (
    <div className="space-y-5">
      <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          {t.title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          {t.description}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label={t.openBalance} value={ledger.summary.openAmountLabel} emphasize />
          <SummaryCard
            label={t.overdueCount}
            value={String(ledger.summary.overdueCount)}
            warn={ledger.summary.overdueCount > 0}
          />
          <SummaryCard
            label={t.unpaidCount}
            value={String(ledger.summary.unpaidCount)}
          />
          <SummaryCard
            label={t.paidCount}
            value={String(ledger.summary.paidCount)}
          />
        </dl>

        <div className="mt-4 flex flex-col gap-3 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
              {t.collectionRef}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
              {ledger.member.collectionRef || t.collectionRefMissing}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {t.collectionRefHint}
            </p>
          </div>
          <Link
            href={routes.membership.dues}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white hover:bg-[var(--color-primary-700)]"
          >
            {t.paymentInfo}
          </Link>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">
          {t.noOnlinePayment}
        </p>
      </div>

      <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {t.periodsTitle}
        </h3>
        {ledger.dues.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            {t.emptyPeriods}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--color-border)]">
            {ledger.dues.map((due) => (
              <li
                key={due.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--color-text)]">
                      {due.periodTitle}
                    </p>
                    <DueStatusBadge
                      status={due.status}
                      label={t.statuses[due.status]}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {t.dueDate}: {formatDate(due.dueDate)}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:text-right">
                  <dt className="text-[var(--color-text-muted)]">{t.assessed}</dt>
                  <dd className="font-medium text-[var(--color-text)]">
                    {due.assessedAmountLabel}
                  </dd>
                  {due.hasPenalty ? (
                    <>
                      <dt className="text-[var(--color-text-muted)]">
                        {t.penalty}
                      </dt>
                      <dd className="font-medium text-[var(--color-text)]">
                        {due.penaltyAmountLabel}
                      </dd>
                    </>
                  ) : null}
                  <dt className="text-[var(--color-text-muted)]">{t.paid}</dt>
                  <dd className="font-medium text-[var(--color-text)]">
                    {due.paidAmountLabel}
                  </dd>
                  <dt className="text-[var(--color-text-muted)]">{t.remaining}</dt>
                  <dd className="font-semibold text-[var(--color-primary-800)]">
                    {due.remainingAmountLabel}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {t.paymentsTitle}
        </h3>
        {ledger.payments.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            {t.emptyPayments}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--color-border)]">
            {ledger.payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {payment.amountLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {t.methods[payment.method]}
                    {payment.paidAt
                      ? ` · ${formatDateTime(payment.paidAt)}`
                      : ""}
                    {payment.receiptNo
                      ? ` · ${t.receiptNo}: ${payment.receiptNo}`
                      : ""}
                  </p>
                  {payment.periodTitles.length > 0 ? (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {payment.periodTitles.join(", ")}
                    </p>
                  ) : null}
                  {payment.note ? (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {payment.note}
                    </p>
                  ) : null}
                </div>
                {payment.hasReceiptFile && payment.receiptId ? (
                  <a
                    href={`/api/member/receipts/${payment.receiptId}/download`}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-xs font-semibold text-[var(--color-primary-800)] hover:bg-[var(--color-surface-soft)]"
                  >
                    {t.receiptDownload}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  emphasize,
  warn,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-3">
      <dt className="text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </dt>
      <dd
        className={`mt-1 text-lg font-bold tabular-nums ${
          warn
            ? "text-[var(--color-accent)]"
            : emphasize
              ? "text-[var(--color-primary-800)]"
              : "text-[var(--color-text)]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function DueStatusBadge({
  status,
  label,
}: {
  status: DueStatus;
  label: string;
}) {
  const tone =
    status === "paid" || status === "waived"
      ? "bg-[var(--color-primary-100)] text-[var(--color-primary-900)]"
      : status === "overdue"
        ? "bg-[color-mix(in_srgb,var(--color-accent)_14%,white)] text-[var(--color-accent)]"
        : "bg-[var(--color-surface-soft)] text-[var(--color-text)] ring-1 ring-[var(--color-border)]";

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}
