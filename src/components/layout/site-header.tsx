"use client";

import { MobileNav } from "@/components/layout/mobile-nav";
import {
  ChevronDownIcon,
  ClipboardIcon,
  InfoIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { isExactPathActive, isNavItemActive } from "@/lib/nav";
import { routes } from "@/lib/routes";
import { publicNav, siteConfig } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SiteHeader() {
  const messages = getMessages();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastScrollY.current;

      if (currentY < 80) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -4) {
        // Slight upward scroll should reveal the header quickly.
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLabels = {
    home: messages.nav.home,
    corporate: messages.nav.corporate,
    membership: messages.nav.membership,
    legislation: messages.nav.legislation,
    events: messages.nav.events,
    news: messages.nav.news,
    contact: messages.nav.contact,
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur transition-transform duration-300 ease-out print:hidden ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-3.5">
          <Link href={routes.home} className="flex min-w-0 items-center gap-3">
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.logo.alt}
              width={66}
              height={66}
              className="h-14 w-14 rounded-full bg-white object-cover ring-1 ring-[var(--color-border)] sm:h-[66px] sm:w-[66px]"
              priority
            />
            <div className="min-w-0">
              <p className="text-[15px] font-extrabold tracking-wide text-[var(--color-primary-900)] sm:text-base">
                <span className="sm:hidden">
                  {messages.brand.nameLine1}
                  <br />
                  {messages.brand.nameLine2}
                </span>
                <span className="hidden sm:inline">{messages.brand.name}</span>
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)] sm:text-[13px]">
                {messages.brand.tagline}
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href={routes.informationRequest}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-xs font-semibold text-[var(--color-text)] shadow-[0_4px_14px_rgba(23,35,29,0.04)] transition hover:border-[var(--color-primary-100)]"
            >
              <InfoIcon className="h-3.5 w-3.5 text-[var(--color-primary-700)]" />
              {messages.nav.informationRequest}
            </Link>
            <Link
              href={routes.complaint}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-xs font-semibold text-[var(--color-text)] shadow-[0_4px_14px_rgba(23,35,29,0.04)] transition hover:border-[var(--color-primary-100)]"
            >
              <ClipboardIcon className="h-3.5 w-3.5 text-[var(--color-primary-700)]" />
              {messages.nav.complaint}
            </Link>
          </div>

          <MobileNav
            labels={navLabels}
            memberLoginLabel={messages.nav.memberLogin}
            searchLabel={messages.nav.search}
          />
        </div>

        <nav
          aria-label="Ana menü"
          className="hidden border-t border-[var(--color-border)] lg:block"
        >
          <div className="flex items-center justify-between gap-4 py-1.5">
            <ul className="flex items-center gap-0.5">
              {publicNav.map((item) => {
                const active = isNavItemActive(pathname, item);

                return (
                  <li key={item.href} className="group/nav relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex items-center gap-1 rounded-[10px] px-3 py-3 text-sm font-semibold transition after:absolute after:right-3 after:bottom-2 after:left-3 after:h-0.5 after:rounded-full after:bg-[var(--color-primary-800)] after:content-[''] ${
                        active
                          ? "text-[var(--color-primary-800)] after:opacity-100"
                          : "text-[var(--color-text)] after:opacity-0 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary-800)]"
                      }`}
                    >
                      <span>{messages.nav[item.labelKey]}</span>
                      {item.children ? (
                        <ChevronDownIcon className="h-4 w-4 opacity-70" />
                      ) : null}
                    </Link>

                    {item.children ? (
                      <div className="absolute left-0 top-full z-50 hidden pt-1 group-hover/nav:block">
                        <div className="min-w-[230px] rounded-[14px] border border-[var(--color-border)] bg-white p-2 shadow-[0_12px_30px_rgba(23,35,29,0.08)]">
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
                                className={`block rounded-[10px] px-3 py-2.5 text-sm transition ${
                                  childActive
                                    ? "bg-[var(--color-primary-100)] font-semibold text-[var(--color-primary-800)]"
                                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
                                }`}
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
              })}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                href={routes.search}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]"
                aria-label={messages.nav.search}
              >
                <SearchIcon className="h-5 w-5" />
              </Link>
              <Link
                href={routes.member.login}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
              >
                <UserIcon className="h-4 w-4" />
                {messages.nav.memberLogin}
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
