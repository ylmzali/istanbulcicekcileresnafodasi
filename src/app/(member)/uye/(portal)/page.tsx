import type { Metadata } from "next";
import Link from "next/link";
import { getMemberSession } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Üye Paneli",
  robots: { index: false, follow: false },
};

export default async function MemberHomePage() {
  const session = await getMemberSession();
  const t = getMessages().memberPortal;

  return (
    <div className="space-y-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="text-base font-semibold text-[var(--color-text)]">
        {t.welcome}
        {session ? `, ${session.displayName}` : ""}
      </h2>
      <p className="text-sm leading-6 text-[var(--color-text-muted)]">
        {t.homeIntro}
      </p>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        <li>
          <Link
            href={routes.member.dues}
            className="block rounded-[10px] border border-[var(--color-border)] px-3 py-3 font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-primary-100)]"
          >
            Aidat
          </Link>
        </li>
        <li>
          <Link
            href={routes.contact}
            className="block rounded-[10px] border border-[var(--color-border)] px-3 py-3 font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-primary-100)]"
          >
            İletişim
          </Link>
        </li>
      </ul>
    </div>
  );
}
