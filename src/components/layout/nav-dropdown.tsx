"use client";

import { ChevronDownIcon } from "@/components/ui/icons";
import { isExactPathActive } from "@/lib/nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type NavChild = {
  href: string;
  label: string;
};

type NavDropdownProps = {
  href: string;
  label: string;
  active: boolean;
  childrenItems: readonly NavChild[];
};

export function NavDropdown({
  href,
  label,
  active,
  childrenItems,
}: NavDropdownProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <li
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center">
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={`relative inline-flex items-center rounded-l-[10px] py-3 pr-1 pl-3 text-sm font-semibold transition after:absolute after:right-1 after:bottom-2 after:left-3 after:h-0.5 after:rounded-full after:bg-[var(--color-primary-800)] after:content-[''] ${
            active
              ? "text-[var(--color-primary-800)] after:opacity-100"
              : "text-[var(--color-text)] after:opacity-0 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary-800)]"
          }`}
        >
          {label}
        </Link>
        <button
          type="button"
          className={`inline-flex h-11 items-center rounded-r-[10px] pr-2.5 pl-0.5 text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary-800)] ${
            active ? "text-[var(--color-primary-800)]" : ""
          }`}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <ChevronDownIcon
            className={`h-4 w-4 opacity-70 transition ${open ? "rotate-180" : ""}`}
          />
          <span className="sr-only">{label} alt menüsü</span>
        </button>
      </div>

      {open ? (
        <div className="absolute left-0 top-full z-50 pt-1">
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="min-w-[230px] rounded-[14px] border border-[var(--color-border)] bg-white p-2 shadow-[0_12px_30px_rgba(23,35,29,0.08)]"
          >
            {childrenItems.map((child) => {
              const childActive = isExactPathActive(pathname, child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  role="menuitem"
                  aria-current={childActive ? "page" : undefined}
                  className={`block rounded-[10px] px-3 py-2.5 text-sm transition ${
                    childActive
                      ? "bg-[var(--color-primary-100)] font-semibold text-[var(--color-primary-800)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </li>
  );
}
