"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { adminLogoutAction } from "@/app/(admin)/yonetim/actions";
import {
  CalendarIcon,
  ClipboardIcon,
  CloseIcon,
  FileCheckIcon,
  HelpCircleIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MessageIcon,
  NewspaperIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  href: string;
  label: string;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

type AdminShellProps = {
  children: React.ReactNode;
  username: string | null;
  labels: {
    brand: string;
    brandShort: string;
    logout: string;
    viewSite: string;
    openMenu: string;
    closeMenu: string;
  };
  navGroups: AdminNavGroup[];
};

const iconByHref: Record<string, React.ComponentType<{ className?: string }>> = {
  [routes.admin.root]: LayoutDashboardIcon,
  [routes.admin.posts]: NewspaperIcon,
  [routes.admin.events]: CalendarIcon,
  [routes.admin.faqs]: HelpCircleIcon,
  [routes.admin.banners]: ImageIcon,
  [routes.admin.resources]: FileCheckIcon,
  [routes.admin.members]: UsersIcon,
  [routes.admin.applications]: ClipboardIcon,
  [routes.admin.dues]: WalletIcon,
  [routes.admin.contactSubmissions]: MailIcon,
  [routes.admin.support]: MessageIcon,
};

function isActive(pathname: string, href: string) {
  if (href === routes.admin.root) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  groups,
  pathname,
  onNavigate,
}: {
  groups: AdminNavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = iconByHref[item.href] ?? LayoutDashboardIcon;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white text-[var(--color-primary-900)] shadow-sm"
                        : "text-white/78 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0 opacity-90" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({
  children,
  username,
  labels,
  navGroups,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const titleId = useId();
  const initial = (username ?? "Y").slice(0, 1).toUpperCase();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const activeLabel =
    navGroups
      .flatMap((group) => group.items)
      .find((item) => isActive(pathname, item.href))?.label ?? labels.brand;

  return (
    <div className="flex min-h-dvh bg-[var(--color-surface-soft)]">
      {/* Desktop rail */}
      <aside
        className="sticky top-0 z-30 hidden h-dvh w-[248px] shrink-0 flex-col bg-[var(--color-primary-900)] text-white lg:flex"
        aria-label={labels.brand}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,white_14%,transparent)] text-xs font-bold tracking-wide">
            {labels.brandShort}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{labels.brand}</p>
            <p className="truncate text-[11px] text-white/55">Süper yönetici</p>
          </div>
        </div>

        <NavList groups={navGroups} pathname={pathname} />

        <div className="space-y-2 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/8 px-2.5 py-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {username ?? "Yönetici"}
              </p>
              <p className="truncate text-[11px] text-white/55">Oturum açık</p>
            </div>
          </div>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOutIcon className="size-[18px] shrink-0" />
              <span>{labels.logout}</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={labels.closeMenu}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-[var(--color-primary-900)] text-white shadow-2xl"
            aria-labelledby={titleId}
          >
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
              <p id={titleId} className="text-sm font-semibold">
                {labels.brand}
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-white/10"
                aria-label={labels.closeMenu}
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <NavList
              groups={navGroups}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <div className="border-t border-white/10 p-3">
              <form action={adminLogoutAction}>
                <button
                  type="submit"
                  className="flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <LogOutIcon className="size-[18px]" />
                  {labels.logout}
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-white/95 px-3 backdrop-blur sm:px-5">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-[var(--color-primary-900)] hover:bg-[var(--color-surface-soft)] lg:hidden"
            aria-label={labels.openMenu}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="size-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-primary-900)]">
              {activeLabel}
            </p>
            <p className="hidden truncate text-[11px] text-[var(--color-text-muted)] sm:block">
              {labels.brand}
            </p>
          </div>

          <Link
            href={routes.home}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)] sm:inline-flex"
          >
            {labels.viewSite}
          </Link>

          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface-soft)] px-2 py-1.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-[11px] font-semibold text-white">
              {initial}
            </span>
            <span className="hidden max-w-[9rem] truncate text-xs font-medium text-[var(--color-text)] md:inline">
              {username ?? "Yönetici"}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
