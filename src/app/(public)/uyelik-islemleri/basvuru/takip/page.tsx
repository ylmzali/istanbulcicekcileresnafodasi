import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationDocumentChecklist } from "@/components/membership/application-track-upload-form";
import { ApplicationTrackLookupForm } from "@/components/membership/application-track-form";
import { MembershipPageShell } from "@/components/membership/membership-page-shell";
import { StatusBadge } from "@/components/admin/form-fields";
import { formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { getPublicApplicationTracking } from "@/services/applications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Başvuru Takip",
  description:
    "Üyelik ön başvurunuzu takip edin ve belgelerinizi tek tek yükleyin.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MembershipApplicationTrackPage({
  searchParams,
}: PageProps) {
  const t = getMessages().membershipApplication;
  const params = await searchParams;
  const raw = params.no;
  const trackingNo =
    (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase() ?? "";
  const result = trackingNo
    ? await getPublicApplicationTracking(trackingNo)
    : null;

  return (
    <MembershipPageShell
      title={t.trackTitle}
      description={t.trackDescription}
      current={routes.membership.applyTrack}
      breadcrumbs={[
        { label: "Üyelik İşlemleri", href: routes.membership.root },
        { label: "Üyelik Başvurusu", href: routes.membership.apply },
        { label: t.trackTitle },
      ]}
    >
      <div className="space-y-8 sm:space-y-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {t.pageEyebrow}
        </p>

        <section className="rounded-[16px] border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-surface-soft)_0%,white_60%)] p-5 sm:p-6">
          <div className="mb-4 max-w-2xl">
            <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
              {t.trackLookupTitle}
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-muted)]">
              {t.trackLookupHint}
            </p>
          </div>
          <ApplicationTrackLookupForm initialTrackingNo={trackingNo} />
        </section>

        {!trackingNo ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
                01
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">
                {t.step1Title}
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {t.step1Body}
              </p>
            </div>
            <div className="rounded-[16px] border border-[color-mix(in_srgb,var(--color-primary-700)_30%,var(--color-border))] bg-[var(--color-primary-100)]/50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-xs font-bold text-white">
                02
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">
                {t.step2Title}
                <span className="ml-2 text-[11px] font-medium text-[var(--color-primary-700)]">
                  {t.stepNow}
                </span>
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {t.step2Body}
              </p>
            </div>
            <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
                03
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">
                {t.step3Title}
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {t.step3Body}
              </p>
            </div>
          </div>
        ) : null}

        {trackingNo && !result ? (
          <div
            role="alert"
            className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_8%,white)] px-4 py-4"
          >
            <p className="text-sm font-semibold text-[var(--color-accent)]">
              {t.trackNotFound}
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              {t.trackNotFoundHint}
            </p>
            <Link
              href={routes.membership.apply}
              className="mt-3 inline-flex text-sm font-semibold text-[var(--color-primary-800)] hover:underline"
            >
              {t.trackGoApply}
            </Link>
          </div>
        ) : null}

        {result ? (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start xl:gap-8">
            <div className="min-w-0 space-y-6">
              <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-5 py-4">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {result.trackingNo}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                      {result.applicantName ?? "—"}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {result.businessName}
                      {result.emailMasked ? ` · ${result.emailMasked}` : ""}
                    </p>
                  </div>
                  <StatusBadge label={result.statusLabel} />
                </div>
                <div className="space-y-3 px-5 py-4">
                  {result.decisionNote ? (
                    <p className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_6%,white)] px-3 py-2 text-sm text-[var(--color-text)]">
                      {result.decisionNote}
                    </p>
                  ) : null}
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {result.submittedAt
                      ? `Ön başvuru: ${formatDateTime(result.submittedAt)}`
                      : `Oluşturma: ${formatDateTime(result.createdAt)}`}
                  </p>
                  {result.canUpload ? (
                    <p className="text-[13px] leading-5 text-[var(--color-primary-900)]">
                      {t.trackProgressHint
                        .replace(
                          "{uploaded}",
                          String(result.uploadedRequiredCount),
                        )
                        .replace("{total}", String(result.requiredCount))}
                    </p>
                  ) : null}
                </div>
              </div>

              <ApplicationDocumentChecklist
                trackingNo={result.trackingNo}
                checklist={result.checklist}
                canUpload={result.canUpload}
                canMarkComplete={result.canMarkComplete}
                uploadedRequiredCount={result.uploadedRequiredCount}
                requiredCount={result.requiredCount}
              />

              <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
                  {t.trackHistory}
                </h2>
                <ol className="relative mt-4 space-y-0 border-l border-[var(--color-border)] pl-4">
                  {result.history.map((item) => (
                    <li key={item.id} className="relative pb-4 last:pb-0">
                      <span
                        aria-hidden
                        className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-primary-700)] bg-white"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-[var(--color-text)]">
                          {item.fromLabel
                            ? `${item.fromLabel} → ${item.toLabel}`
                            : item.toLabel}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                      {item.note ? (
                        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                          {item.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-28">
              <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {t.trackTipsTitle}
                </p>
                <ul className="mt-3 space-y-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                  <li>{t.trackTip1}</li>
                  <li>{t.trackTip2}</li>
                  <li>{t.trackTip3}</li>
                </ul>
              </div>
              <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {t.trackNewTitle}
                </p>
                <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                  {t.trackNewBody}
                </p>
                <Link
                  href={routes.membership.apply}
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--color-primary-800)] hover:underline"
                >
                  {t.trackGoApply}
                </Link>
              </div>
            </aside>
          </div>
        ) : null}

        {!result ? (
          <aside className="flex flex-col gap-3 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {t.trackNoNumberTitle}
              </p>
              <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
                {t.trackNoNumberBody}
              </p>
            </div>
            <Link
              href={routes.membership.apply}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
            >
              {t.trackStartApply}
            </Link>
          </aside>
        ) : null}
      </div>
    </MembershipPageShell>
  );
}
