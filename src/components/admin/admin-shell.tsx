"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/app/(admin)/yonetim/actions";
import {
  CalendarIcon,
  ClipboardIcon,
  FileCheckIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapPinIcon,
  MessageIcon,
  NewspaperIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type AdminShellProps = {
  children: React.ReactNode;
  username: string | null;
  labels: {
    brand: string;
    logout: string;
  };
  navItems: NavItem[];
};

const iconByHref: Record<string, React.ComponentType<{ className?: string }>> = {
  [routes.admin.root]: LayoutDashboardIcon,
  [routes.admin.posts]: NewspaperIcon,
  [routes.admin.events]: CalendarIcon,
  [routes.admin.faqs]: HelpCircleIcon,
  [routes.admin.members]: UsersIcon,
  [routes.admin.applications]: ClipboardIcon,
  [routes.admin.documentRequests]: FileCheckIcon,
  [routes.admin.dues]: WalletIcon,
  [routes.admin.appointments]: CalendarIcon,
  [routes.admin.support]: MessageIcon,
  [routes.admin.florists]: MapPinIcon,
};

function isActive(pathname: string, href: string) {
  if (href === routes.admin.root) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  username,
  labels,
  navItems,
}: AdminShellProps) {
  const pathname = usePathname();
  const initial = (username ?? "Y").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-soft)]">
      <aside
        className="sticky top-0 z-30 flex h-screen w-[220px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-primary-900)] text-white"
        aria-label={labels.brand}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/12 text-sm font-semibold">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white/70">{labels.brand}</p>
            <p className="truncate text-sm font-semibold">
              {username ?? "Yönetici"}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
          {navItems.map((item) => {
            const Icon = iconByHref[item.href] ?? LayoutDashboardIcon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-[var(--color-primary-900)]"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-2.5">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOutIcon className="size-5 shrink-0" />
              <span>{labels.logout}</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:hidden">
          <p className="text-sm font-semibold text-[var(--color-primary-900)]">
            {labels.brand}
          </p>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="rounded-[10px] px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]"
            >
              {labels.logout}
            </button>
          </form>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 sm:hidden"
          aria-label={labels.brand}
        >
          {navItems.map((item) => {
            const Icon = iconByHref[item.href] ?? LayoutDashboardIcon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm",
                  active
                    ? "bg-[var(--color-primary-100)] text-[var(--color-primary-900)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
