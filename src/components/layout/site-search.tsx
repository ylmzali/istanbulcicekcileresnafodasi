"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SearchResultItem } from "@/services/search";

type SearchResponse = {
  success?: boolean;
  message?: string;
  data?: {
    q: string;
    items: SearchResultItem[];
    counts: { total: number };
  } | null;
};

type SiteSearchContextValue = {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

const SiteSearchContext = createContext<SiteSearchContextValue | null>(null);

export function useSiteSearch() {
  const ctx = useContext(SiteSearchContext);
  if (!ctx) {
    throw new Error("useSiteSearch must be used within SiteSearchProvider");
  }
  return ctx;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function shortcutLabel() {
  if (typeof navigator === "undefined") return "Ctrl K";
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  return isMac ? "⌘K" : "Ctrl K";
}

export function SiteSearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;
      // Allow native browser find only when typing without modifier intent.
      if (isEditableTarget(event.target) && event.altKey) return;
      event.preventDefault();
      setOpen((value) => !value);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(
    () => ({ open, openSearch, closeSearch }),
    [open, openSearch, closeSearch],
  );

  return (
    <SiteSearchContext.Provider value={value}>
      {children}
      <SiteSearchDialog open={open} onClose={closeSearch} />
    </SiteSearchContext.Provider>
  );
}

export function SiteSearchTrigger({
  className,
  showLabel = false,
  label,
}: {
  className?: string;
  showLabel?: boolean;
  label?: string;
}) {
  const { openSearch } = useSiteSearch();
  const t = getMessages().search;
  const buttonLabel = label ?? t.openLabel;

  return (
    <button
      type="button"
      onClick={openSearch}
      className={className}
      aria-label={buttonLabel}
      aria-haspopup="dialog"
    >
      <SearchIcon className={showLabel ? "h-4 w-4" : "h-5 w-5"} />
      {showLabel ? <span>{buttonLabel}</span> : null}
    </button>
  );
}

function SiteSearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = getMessages().search;
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shortcut, setShortcut] = useState("Ctrl K");

  useEffect(() => {
    setShortcut(shortcutLabel());
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQ("");
      setItems([]);
      setError(null);
      setLoading(false);
      setActiveIndex(0);
      requestIdRef.current += 1;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setItems([]);
      setError(null);
      setLoading(false);
      setActiveIndex(0);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/public/search?q=${encodeURIComponent(trimmed)}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as SearchResponse;
        if (requestId !== requestIdRef.current) return;

        if (!response.ok || !payload.success || !payload.data) {
          setItems([]);
          setError(payload.message || t.error);
          return;
        }

        setItems(payload.data.items);
        setActiveIndex(0);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setItems([]);
        setError(t.error);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [q, open, t.error]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>(
      `[data-search-index="${activeIndex}"]`,
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, items]);

  function goTo(href: string) {
    onClose();
    router.push(href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((value) => (value + 1) % items.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((value) => (value - 1 + items.length) % items.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) goTo(item.href);
    }
  }

  if (!open) return null;

  const trimmed = q.trim();
  const showHint = trimmed.length < 2;
  const showEmpty = !loading && !error && !showHint && items.length === 0;

  return (
    <div className="fixed inset-0 z-[80] print:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)] backdrop-blur-[2px]"
        aria-label={t.close}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 top-[10vh] mx-auto w-[min(100%-1.5rem,40rem)] overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_28px_80px_rgba(23,35,29,0.28)] sm:top-[12vh]"
      >
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2.5 sm:px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-[var(--color-primary-700)]" />
          <label htmlFor="site-search-dialog-q" className="sr-only">
            {t.inputLabel}
          </label>
          <input
            ref={inputRef}
            id="site-search-dialog-q"
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={t.placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={80}
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <kbd className="hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)] sm:inline">
            {shortcut}
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]"
            aria-label={t.close}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pt-2.5 pb-1 sm:px-4">
          <p id={titleId} className="text-xs font-medium text-[var(--color-text-muted)]">
            {t.dialogHint}
          </p>
        </div>

        <div
          ref={listRef}
          className="max-h-[min(58vh,26rem)] overflow-y-auto overscroll-contain px-2 pb-2 sm:px-2.5"
          role="listbox"
          aria-label={t.resultsLabel}
        >
          {loading ? (
            <p className="px-2 py-6 text-center text-sm text-[var(--color-text-muted)]">
              {t.loading}
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="px-2 py-6 text-center text-sm text-[var(--color-accent)]"
            >
              {error}
            </p>
          ) : null}

          {showHint && !loading ? (
            <div className="space-y-2 px-2 py-4">
              <p className="text-sm text-[var(--color-text-muted)]">{t.hint}</p>
              <ul className="flex flex-wrap gap-1.5">
                {t.suggestions.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => setQ(item)}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-800)] hover:border-[var(--color-primary-100)]"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showEmpty ? (
            <p className="px-2 py-6 text-center text-sm text-[var(--color-text-muted)]">
              {t.empty.replace("{q}", trimmed)}
            </p>
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <ul className="space-y-0.5 py-1">
              {items.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <li key={`${item.kind}-${item.id}`} role="option" aria-selected={active}>
                    <Link
                      href={item.href}
                      data-search-index={index}
                      onClick={(event) => {
                        event.preventDefault();
                        goTo(item.href);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "block rounded-[12px] px-3 py-2.5 transition",
                        active
                          ? "bg-[var(--color-primary-100)]/80"
                          : "hover:bg-[var(--color-surface-soft)]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold tracking-wide text-[var(--color-primary-700)] uppercase">
                            {item.meta}
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-[var(--color-text)]">
                            {item.title}
                          </p>
                          {item.excerpt ? (
                            <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
                              {item.excerpt}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)]/70 px-3 py-2 text-[11px] text-[var(--color-text-muted)] sm:px-4">
          <span>{t.footerNav}</span>
          <span className="hidden sm:inline">{t.footerEsc}</span>
        </div>
      </div>
    </div>
  );
}
