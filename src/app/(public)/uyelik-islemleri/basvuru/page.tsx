import type { Metadata } from "next";
import Link from "next/link";
import { MembershipPageShell } from "@/components/membership/membership-page-shell";
import { membershipRegistration } from "@/lib/membership/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Üyelik Başvurusu",
  description:
    "İstanbul Çiçekçiler Esnaf Odası üyelik başvurusu için gerekli belgeler ve süreç bilgisi.",
};

export default function MembershipApplicationPage() {
  const documents = membershipRegistration.documents;

  return (
    <MembershipPageShell
      title="Üyelik Başvurusu"
      description="Online başvuru formu sonraki fazda açılacaktır. Şimdilik gerekli belgeler ve süreç bilgisini inceleyebilirsiniz."
      current={routes.membership.apply}
      breadcrumbs={[
        { label: "Üyelik İşlemleri", href: routes.membership.root },
        { label: "Üyelik Başvurusu" },
      ]}
    >
      <div className="space-y-8">
        <p className="text-[15px] leading-7 text-[var(--color-text-muted)] sm:leading-8">
          {membershipRegistration.process.paragraphs[0]} Başvuruya başlamadan
          önce üyelik koşullarını ve evrak listesini kontrol etmenizi öneririz.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-primary-900)]">
            {documents.title}
          </h2>
          <p className="text-[15px] leading-7 text-[var(--color-text-muted)]">
            {documents.intro}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {documents.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm font-medium text-[var(--color-text)]"
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

        <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-8">
          <Link
            href={routes.membership.root}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
          >
            Üyelik Koşullarını İncele
          </Link>
          <Link
            href={routes.contact}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
          >
            İletişime Geç
          </Link>
        </div>
      </div>
    </MembershipPageShell>
  );
}
