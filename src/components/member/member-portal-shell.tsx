import Link from "next/link";
import { memberLogoutAction } from "@/app/(member)/uye/actions";
import type { MemberSessionUser } from "@/lib/auth/session";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";

const nav = [
  { href: routes.member.home, label: "Özet" },
  { href: routes.member.dues, label: "Aidat" },
] as const;

export function MemberPortalShell({
  session,
  children,
}: {
  session: MemberSessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[960px] flex-1 px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Üye paneli
          </p>
          <h1 className="text-lg font-semibold text-[var(--color-text)]">
            {session.displayName}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Üye no: {session.memberNo}
          </p>
        </div>
        <form action={memberLogoutAction}>
          <Button type="submit" size="sm" variant="outline">
            Çıkış yap
          </Button>
        </form>
      </header>

      <nav aria-label="Üye menü" className="mb-6 flex flex-wrap gap-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary-700)] hover:text-[var(--color-primary-800)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
