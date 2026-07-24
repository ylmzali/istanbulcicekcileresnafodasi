import type { Metadata } from "next";
import Link from "next/link";
import { MembershipPageShell } from "@/components/membership/membership-page-shell";
import { membershipRegistration } from "@/lib/membership/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: membershipRegistration.title,
  description: membershipRegistration.description,
};

export default function MembershipPage() {
  const content = membershipRegistration;

  return (
    <MembershipPageShell
      title={content.title}
      description={content.description}
      current={routes.membership.root}
      breadcrumbs={[{ label: "Üyelik İşlemleri" }]}
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.whyJoin.title}
          </h2>
          <div className="space-y-4 text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
            {content.whyJoin.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.conditions.title}
          </h2>
          <p className="text-[15px] leading-7 text-[var(--color-text-muted)]">
            {content.conditions.intro}
          </p>
          <ol className="space-y-3">
            {content.conditions.items.map((item, index) => (
              <li
                key={item.slice(0, 40)}
                className="flex gap-3 text-[15px] leading-7 text-[var(--color-text)]"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-800)]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.process.title}
          </h2>
          <p className="text-[15px] font-medium text-[var(--color-text)]">
            {content.process.greeting}
          </p>
          <div className="space-y-4 text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
            {content.process.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {content.documents.title}
          </h2>
          <p className="text-[15px] leading-7 text-[var(--color-text-muted)]">
            {content.documents.intro}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {content.documents.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text)]"
              >
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-700)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 border-l-[3px] border-[var(--color-accent)] pl-4">
          <h2 className="text-lg font-semibold text-[var(--color-primary-900)]">
            {content.notice.title}
          </h2>
          <div className="space-y-3 text-[15px] leading-7 text-[var(--color-text-muted)]">
            {content.notice.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-8">
          <Link
            href={routes.membership.apply}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
          >
            Üyelik Başvurusu
          </Link>
          <Link
            href={routes.contact}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
          >
            İletişime Geç
          </Link>
        </div>
      </div>
    </MembershipPageShell>
  );
}
