import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationStatusForm } from "@/components/admin/application-status-form";
import {
  AdminFormCard,
  AdminPageHeader,
  StatusBadge,
} from "@/components/admin/form-fields";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { getApplicationByIdForAdmin } from "@/services/applications";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await getApplicationByIdForAdmin(id);
  return {
    title: app ? `Başvuru ${app.trackingNo}` : "Başvuru",
    robots: { index: false, follow: false },
  };
}

export default async function AdminApplicationDetailPage({
  params,
}: PageProps) {
  await requireAdminPermission("applications.manage");
  const a = getMessages().admin;
  const { id } = await params;
  const app = await getApplicationByIdForAdmin(id);
  if (!app) notFound();

  const form = app.form;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={`${a.applicationDetail}: ${app.trackingNo}`}
        description={`${app.statusLabel} · ${
          app.submittedAt
            ? `Gönderim ${formatDateTime(app.submittedAt)}`
            : `Oluşturma ${formatDateTime(app.createdAt)}`
        }`}
        actions={
          <Link
            href={routes.admin.applications}
            className="text-sm font-medium text-[var(--color-primary-800)] hover:underline"
          >
            Listeye dön
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={app.statusLabel} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFormCard className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {a.applicationApplicant}
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Ad soyad</dt>
              <dd className="font-medium">
                {form ? `${form.firstName} ${form.lastName}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">T.C. kimlik</dt>
              <dd className="font-medium">{form?.identityNo ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Telefon</dt>
              <dd className="font-medium">{form?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">E-posta</dt>
              <dd className="font-medium">{form?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">İşletme</dt>
              <dd className="font-medium">{form?.businessName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Vergi dairesi</dt>
              <dd className="font-medium">{form?.taxOffice ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">Vergi no</dt>
              <dd className="font-medium">{form?.taxNo ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--color-text-muted)]">Adres</dt>
              <dd className="font-medium">
                {form
                  ? `${form.address} — ${form.districtName} / ${form.cityName}`
                  : "—"}
              </dd>
            </div>
            {form?.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--color-text-muted)]">Not</dt>
                <dd className="whitespace-pre-line font-medium">{form.notes}</dd>
              </div>
            ) : null}
          </dl>
        </AdminFormCard>

        <AdminFormCard className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {a.applicationChangeStatus}
          </h2>
          {app.decisionNote ? (
            <p className="rounded-[10px] bg-[var(--color-surface-soft)] px-3 py-2 text-sm">
              <span className="text-xs text-[var(--color-text-muted)]">
                {a.applicationDecisionNote}:{" "}
              </span>
              {app.decisionNote}
            </p>
          ) : null}
          <ApplicationStatusForm
            applicationId={app.id}
            currentStatus={app.status}
          />
        </AdminFormCard>
      </div>

      <AdminFormCard className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {a.applicationDocuments}
        </h2>
        {app.documents.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {a.applicationNoDocuments}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {app.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {doc.documentType?.name ?? doc.originalName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {doc.mimeType} · {(doc.size / 1024).toFixed(0)} KB ·{" "}
                    {formatDateTime(doc.createdAt)}
                  </p>
                </div>
                <a
                  href={`/api/admin/applications/${app.id}/documents/${doc.id}`}
                  className="font-semibold text-[var(--color-primary-800)] hover:underline"
                >
                  {a.applicationDownload}
                </a>
              </li>
            ))}
          </ul>
        )}
      </AdminFormCard>

      <AdminFormCard className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {a.applicationHistory}
        </h2>
        <ol className="space-y-2">
          {app.history.map((item) => (
            <li
              key={item.id}
              className="rounded-[10px] border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {item.fromLabel
                    ? `${item.fromLabel} → ${item.toLabel}`
                    : item.toLabel}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              {item.note ? (
                <p className="mt-1 text-[var(--color-text-muted)]">{item.note}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </AdminFormCard>
    </div>
  );
}
