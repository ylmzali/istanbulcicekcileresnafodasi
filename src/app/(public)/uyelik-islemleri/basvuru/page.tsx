import type { Metadata } from "next";
import Link from "next/link";
import { MembershipApplicationForm } from "@/components/membership/membership-application-form";
import { MembershipPageShell } from "@/components/membership/membership-page-shell";
import { getMessages } from "@/lib/i18n";
import { membershipRegistration } from "@/lib/membership/content";
import { routes } from "@/lib/routes";
import { listLocationOptions } from "@/services/members";

export const metadata: Metadata = {
  title: "Üyelik Başvurusu",
  description:
    "Ön başvurunuzu online başlatın; belgelerinizi takip numarasıyla adım adım yükleyin.",
};

export default async function MembershipApplicationPage() {
  const t = getMessages().membershipApplication;
  const cities = await listLocationOptions();
  const districts = cities.flatMap((city) =>
    city.districts.map((district) => ({
      id: district.id,
      name: district.name,
    })),
  );
  const documents = membershipRegistration.documents;

  const steps = [
    { n: "01", title: t.step1Title, body: t.step1Body, active: true },
    { n: "02", title: t.step2Title, body: t.step2Body, active: false },
    { n: "03", title: t.step3Title, body: t.step3Body, active: false },
  ] as const;

  return (
    <MembershipPageShell
      title="Üyelik Başvurusu"
      description="Ön başvurunuzu birkaç dakikada tamamlayın. Belgeleri daha sonra takip numaranız ile adım adım yükleyebilirsiniz."
      current={routes.membership.apply}
      breadcrumbs={[
        { label: "Üyelik İşlemleri", href: routes.membership.root },
        { label: "Üyelik Başvurusu" },
      ]}
    >
      <div className="space-y-8 sm:space-y-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {t.pageEyebrow}
        </p>

        <section aria-labelledby="process-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2
              id="process-heading"
              className="text-base font-semibold text-[var(--color-primary-900)]"
            >
              {t.processTitle}
            </h2>
          </div>
          <ol className="grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.n}
                className={
                  step.active
                    ? "relative rounded-[16px] border border-[color-mix(in_srgb,var(--color-primary-700)_35%,var(--color-border))] bg-[var(--color-primary-100)]/60 px-4 py-4"
                    : "relative rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4"
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className={
                      step.active
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-xs font-bold text-white"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-xs font-bold text-[var(--color-primary-800)]"
                    }
                  >
                    {step.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {step.title}
                      {index === 0 ? (
                        <span className="ml-2 text-[11px] font-medium text-[var(--color-primary-700)]">
                          {t.stepNow}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-muted)]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="flex flex-col gap-3 rounded-[16px] border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-surface-soft)_0%,white_55%)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {t.trackBannerTitle}
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
              {t.trackBannerBody}
            </p>
          </div>
          <Link
            href={routes.membership.applyTrack}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-primary-800)] transition hover:border-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)]"
          >
            {t.trackLink}
          </Link>
        </aside>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start xl:gap-10">
          <div className="min-w-0">
            <div className="mb-5 rounded-[12px] border border-[color-mix(in_srgb,var(--color-primary-700)_20%,var(--color-border))] bg-[var(--color-primary-100)]/40 px-4 py-3 text-[13px] leading-5 text-[var(--color-primary-900)]">
              {t.formNotice}
            </div>
            <MembershipApplicationForm districts={districts} />
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28">
            <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
              <h2 className="text-sm font-semibold text-[var(--color-primary-900)]">
                {t.documentsAsideTitle}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {t.documentsLaterHint}
              </p>
              <ul className="mt-4 space-y-2.5">
                {documents.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[13px] leading-5 text-[var(--color-text)]"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-700)]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {documents.title}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                {t.documentsAsideFooter}
              </p>
              <Link
                href={routes.membership.root}
                className="mt-4 inline-flex text-sm font-semibold text-[var(--color-primary-800)] hover:underline"
              >
                {t.conditionsLink}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </MembershipPageShell>
  );
}
