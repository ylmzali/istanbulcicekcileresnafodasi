import Link from "next/link";
import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/components/layout/breadcrumb";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const links = [
  { href: routes.membership.root, label: "Üyelik Koşulları" },
  { href: routes.membership.apply, label: "Üyelik Başvurusu" },
  { href: routes.membership.dues, label: "Aidat Sorgulama" },
  { href: routes.documentVerification, label: "Evrak Doğrulama" },
] as const;

export function MembershipSubnav({ current }: { current: string }) {
  return (
    <nav aria-label="Üyelik işlemleri alt menü">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
        Üyelik İşlemleri
      </p>
      <ul className="space-y-0.5">
        {links.map((link) => {
          const active = current === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex min-h-11 items-center rounded-lg border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-[var(--color-primary-700)] bg-[var(--color-primary-100)] text-[var(--color-primary-900)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:bg-white hover:text-[var(--color-primary-800)]",
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MembershipPageShell({
  title,
  description,
  current,
  breadcrumbs,
  children,
}: {
  title: string;
  description?: string;
  current: string;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-[var(--color-surface-soft)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-100)_70%,white)_0%,transparent_100%)]"
      />
      <div className="relative mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumb items={breadcrumbs} />

        <div className="mt-2 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[18px] border border-[var(--color-border)] bg-white/90 p-4 shadow-[0_10px_28px_rgba(23,35,29,0.04)]">
              <MembershipSubnav current={current} />
            </div>
          </aside>

          <div className="min-w-0">
            <header className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary-900)] sm:text-[2.35rem] sm:leading-tight">
                {title}
              </h1>
              {description ? (
                <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                  {description}
                </p>
              ) : null}
            </header>

            <div className="rounded-[22px] border border-[var(--color-border)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(23,35,29,0.05)] sm:p-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
