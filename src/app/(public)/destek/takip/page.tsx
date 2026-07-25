import type { Metadata } from "next";
import Link from "next/link";
import { SupportTrackLookupForm } from "@/components/content/support-track-lookup";
import { SupportTrackReplyForm } from "@/components/content/support-track-reply-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { StatusBadge } from "@/components/admin/form-fields";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { getPublicSupportTracking } from "@/services/support";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Talep takip",
  description:
    "Bilgi edinme, dilek veya şikâyet takip numaranız ile durumunuzu görüntüleyin.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SupportTrackPage({ searchParams }: PageProps) {
  const t = getMessages().supportForms;
  const page = t.track;
  const params = await searchParams;
  const trackingNo = param(params.no).trim().toUpperCase();
  const result = trackingNo
    ? await getPublicSupportTracking(trackingNo)
    : null;

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumb
          items={[
            { label: t.information.title, href: routes.informationRequest },
            { label: page.title },
          ]}
        />
        <header className="mt-2 mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
            {page.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-primary-900)] sm:text-[2.35rem]">
            {page.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
            {page.description}
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-[var(--color-text)]">
                {page.lookupTitle}
              </h2>
              <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                {page.lookupHint}
              </p>
              <SupportTrackLookupForm initialTrackingNo={trackingNo} />
            </section>

            {trackingNo && !result ? (
              <section className="rounded-[16px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-8 text-center">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {page.notFound}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {page.notFoundHint}
                </p>
              </section>
            ) : null}

            {result ? (
              <>
                <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={result.statusLabel} />
                    <span className="rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                      {result.typeLabel}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-[var(--color-text-muted)]">
                        Takip
                      </dt>
                      <dd className="font-mono font-semibold">
                        {result.trackingNo}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-text-muted)]">
                        {page.subject}
                      </dt>
                      <dd className="font-medium">{result.subject}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-text-muted)]">
                        {page.createdAt}
                      </dt>
                      <dd>{formatDateTime(result.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[var(--color-text-muted)]">
                        {page.dueAt}
                      </dt>
                      <dd>
                        {result.dueAt ? formatDate(result.dueAt) : "—"}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                  <h2 className="mb-4 text-base font-semibold text-[var(--color-text)]">
                    {page.thread}
                  </h2>
                  {result.messages.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">—</p>
                  ) : (
                    <ul className="space-y-3">
                      {result.messages.map((item) => (
                        <li
                          key={item.id}
                          className={
                            item.fromStaff
                              ? "rounded-[12px] border border-[color-mix(in_srgb,var(--color-primary-700)_25%,var(--color-border))] bg-[var(--color-primary-100)]/50 px-4 py-3"
                              : "rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3"
                          }
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
                            <span className="font-semibold text-[var(--color-text)]">
                              {item.fromStaff ? page.fromStaff : page.fromYou}
                            </span>
                            <time dateTime={item.createdAt.toISOString()}>
                              {formatDateTime(item.createdAt)}
                            </time>
                          </div>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--color-text)]">
                            {item.message}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                  {result.canReply ? (
                    <>
                      <h2 className="mb-4 text-base font-semibold text-[var(--color-text)]">
                        {page.replyTitle}
                      </h2>
                      <SupportTrackReplyForm trackingNo={result.trackingNo} />
                    </>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {page.closedHint}
                    </p>
                  )}
                </section>
              </>
            ) : null}
          </div>

          <aside className="space-y-3 xl:sticky xl:top-24">
            <Link
              href={routes.informationRequest}
              className="block rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-primary-100)]/40"
            >
              {page.newInfo}
            </Link>
            <Link
              href={routes.complaint}
              className="block rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-primary-100)]/40"
            >
              {page.newComplaint}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
