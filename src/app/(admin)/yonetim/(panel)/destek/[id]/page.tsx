import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportMessageForm } from "@/components/admin/support-message-form";
import { SupportStatusForm } from "@/components/admin/support-status-form";
import {
  AdminFormCard,
  AdminPageHeader,
  StatusBadge,
} from "@/components/admin/form-fields";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { INPUT_FORMATS } from "@/lib/input-formats";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { getSupportRequestByIdForAdmin } from "@/services/support";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const request = await getSupportRequestByIdForAdmin(id);
  return {
    title: request ? `Destek ${request.trackingNo}` : "Destek",
    robots: { index: false, follow: false },
  };
}

export default async function AdminSupportDetailPage({ params }: PageProps) {
  await requireAdminPermission("support.manage");
  const a = getMessages().admin;
  const { id } = await params;
  const request = await getSupportRequestByIdForAdmin(id);
  if (!request) notFound();

  const phoneDisplay = request.applicantPhone
    ? INPUT_FORMATS.phoneTr.format(request.applicantPhone)
    : "—";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={`${a.supportDetail}: ${request.trackingNo}`}
        description={`${request.typeLabel} · ${formatDateTime(request.createdAt)}`}
        actions={
          <Link
            href={routes.admin.support}
            className="text-sm font-medium text-[var(--color-primary-800)] hover:underline"
          >
            Listeye dön
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={request.statusLabel} />
        {request.dueAt ? (
          <span className="rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">
            {a.supportDueAt}: {formatDate(request.dueAt)}
          </span>
        ) : null}
        {request.assignee ? (
          <span className="rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">
            {a.supportAssignee}: {request.assignee.username}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFormCard className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {a.supportApplicant}
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Ad soyad</dt>
              <dd className="font-medium">{request.applicantName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">E-posta</dt>
              <dd className="font-medium">{request.applicantEmail ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Telefon</dt>
              <dd className="font-medium">{phoneDisplay}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Tür</dt>
              <dd className="font-medium">{request.typeLabel}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--color-text-muted)]">Konu</dt>
              <dd className="font-medium">{request.subject}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--color-text-muted)]">İlk mesaj</dt>
              <dd className="whitespace-pre-line font-medium">
                {request.message}
              </dd>
            </div>
          </dl>
        </AdminFormCard>

        <AdminFormCard className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {a.supportChangeStatus}
          </h2>
          <SupportStatusForm
            requestId={request.id}
            currentStatus={request.status}
          />
        </AdminFormCard>
      </div>

      <AdminFormCard className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {a.supportMessages}
        </h2>
        {request.messages.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">—</p>
        ) : (
          <ul className="space-y-3">
            {request.messages.map((item) => (
              <li
                key={item.id}
                className={
                  item.visibility === "internal"
                    ? "rounded-[12px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3"
                    : "rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3"
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>
                    <span className="font-semibold text-[var(--color-text)]">
                      {item.senderLabel}
                    </span>
                    {" · "}
                    {item.visibilityLabel}
                  </span>
                  <time dateTime={item.createdAt.toISOString()}>
                    {formatDateTime(item.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6">
                  {item.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AdminFormCard>

      <AdminFormCard className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Yanıt / not ekle
        </h2>
        <SupportMessageForm requestId={request.id} />
      </AdminFormCard>
    </div>
  );
}
