"use client";

import {
  MapPinIcon,
  MaximizeIcon,
  MinimizeIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type DirectoryMapProps = {
  mapTitle: string;
};

export function DirectoryMap({ mapTitle }: DirectoryMapProps) {
  const messages = getMessages();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Fullscreen may be blocked by the browser; map remains usable inline.
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden border border-[var(--color-border)] bg-white shadow-[0_18px_40px_rgba(23,35,29,0.06)] ${
        isFullscreen
          ? "flex h-screen w-screen flex-col rounded-none"
          : "rounded-[24px]"
      }`}
    >
      <div className="relative z-10 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 sm:p-5 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:border-0 lg:bg-transparent lg:p-5">
        <div className="lg:pointer-events-auto lg:mx-auto lg:max-w-3xl lg:rounded-[14px] lg:border lg:border-[var(--color-border)] lg:bg-white/95 lg:p-3 lg:shadow-[0_12px_28px_rgba(23,35,29,0.12)] lg:backdrop-blur">
          <form
            action={routes.florists}
            method="get"
            className="mx-auto grid w-full max-w-4xl gap-2 lg:max-w-none lg:grid-cols-[1fr_1.4fr_auto] lg:gap-1.5"
          >
            <label className="sr-only" htmlFor="district">
              {messages.directory.district}
            </label>
            <select
              id="district"
              name="district"
              className="h-11 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-sm lg:h-9 lg:rounded-[8px] lg:text-[13px]"
              defaultValue=""
            >
              <option value="" disabled>
                {messages.directory.district}
              </option>
            </select>

            <label className="sr-only" htmlFor="q">
              {messages.directory.search}
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] lg:left-2.5 lg:h-3.5 lg:w-3.5" />
              <input
                id="q"
                name="q"
                placeholder="İşletme adıyla arayın"
                className="h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-white pr-3 pl-9 text-sm lg:h-9 lg:rounded-[8px] lg:pr-2.5 lg:pl-8 lg:text-[13px]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] lg:h-9 lg:rounded-[8px] lg:px-3.5 lg:text-[13px]"
            >
              <SearchIcon className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
              Çiçekçi Bul
            </button>
          </form>

          <p className="mx-auto mt-3 flex max-w-4xl items-center gap-2 text-xs font-medium text-[var(--color-primary-900)] sm:text-sm lg:mt-2 lg:max-w-none lg:text-[11px]">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 lg:h-3.5 lg:w-3.5" />
            Yalnızca odaya kayıtlı ve yayına izin vermiş işletmeler listelenir.
          </p>
        </div>
      </div>

      <div
        className={`relative ${
          isFullscreen ? "min-h-0 flex-1" : "min-h-[380px] lg:min-h-[460px]"
        }`}
      >
        <iframe
          title={mapTitle}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          src="https://www.openstreetmap.org/export/embed.html?bbox=28.65%2C40.90%2C29.35%2C41.25&layer=mapnik&marker=41.037%2C28.985"
        />

        <div className="absolute right-4 bottom-4 z-10 flex items-center gap-2">
          <Link
            href={routes.florists}
            className="hidden items-center gap-2 rounded-[12px] bg-white/95 px-3 py-2 text-xs text-[var(--color-text-muted)] shadow-sm ring-1 ring-[var(--color-border)] sm:inline-flex"
          >
            <MapPinIcon className="h-4 w-4 text-[var(--color-primary-700)]" />
            <span className="font-semibold text-[var(--color-primary-800)]">
              {messages.directory.cta}
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-white/95 px-3.5 text-sm font-semibold text-[var(--color-primary-900)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:bg-white"
            aria-pressed={isFullscreen}
            aria-label={
              isFullscreen
                ? messages.directory.fullscreenExit
                : messages.directory.fullscreenEnter
            }
          >
            {isFullscreen ? (
              <MinimizeIcon className="h-4 w-4" />
            ) : (
              <MaximizeIcon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen
                ? messages.directory.fullscreenExit
                : messages.directory.fullscreenEnter}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
