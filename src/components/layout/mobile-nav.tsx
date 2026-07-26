"use client";

import { useSiteSearch } from "@/components/layout/site-search";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { isExactPathActive, isNavItemActive } from "@/lib/nav";
import { routes } from "@/lib/routes";
import { publicNav } from "@/lib/site";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MobileNavProps = {
  labels: Record<string, string>;
  memberLoginLabel: string;
  searchLabel: string;
};

export function MobileNav({
  labels,
  memberLoginLabel,
  searchLabel,
}: MobileNavProps) {
  const pathname = usePathname();
  const { open: searchOpen, openSearch } = useSiteSearch();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) setOpen(false);
  }, [searchOpen]);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      document.removeEventListener("keydown", onKeyDown);
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] text-[var(--color-primary-900)]"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        <span className="sr-only">{open ? "Menüyü kapat" : "Menüyü aç"}</span>
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="absolute top-full right-0 left-0 z-50 max-h-[calc(100dvh-5.75rem)] overflow-y-auto overscroll-y-contain border-b border-[var(--color-border)] bg-white shadow-lg"
        >
          <nav className="mx-auto max-w-[1280px] space-y-1 px-4 py-4 sm:px-6">
            {publicNav.map((item) => {
              const active = isNavItemActive(pathname, item);

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-[10px] px-3 py-3 text-sm font-medium hover:bg-[var(--color-surface-soft)] ${
                      active
                        ? "bg-[var(--color-primary-100)] font-semibold text-[var(--color-primary-800)]"
                        : "text-[var(--color-text)]"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {labels[item.labelKey]}
                  </Link>
                  {item.children ? (
                    <div className="mb-2 ml-3 space-y-1 border-l border-[var(--color-border)] pl-3">
                      {item.children.map((child) => {
                        const childActive = isExactPathActive(
                          pathname,
                          child.href,
                        );
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            aria-current={childActive ? "page" : undefined}
                            className={`block rounded-[8px] px-2 py-2 text-sm hover:bg-[var(--color-surface-soft)] ${
                              childActive
                                ? "font-semibold text-[var(--color-primary-800)]"
                                : "text-[var(--color-text-muted)]"
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="flex gap-2 pt-3">
              <button
                type="button"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border)] text-sm"
                onClick={() => {
                  setOpen(false);
                  openSearch();
                }}
              >
                <SearchIcon className="h-4 w-4" />
                {searchLabel}
              </button>
              <Link
                href={routes.member.login}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] text-sm font-medium text-white"
                onClick={() => setOpen(false)}
              >
                {memberLoginLabel}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
