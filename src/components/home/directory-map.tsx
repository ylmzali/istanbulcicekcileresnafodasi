"use client";

import {
  IstanbulMap,
  type IstanbulMapMarker,
} from "@/components/home/istanbul-map";
import { FloristCard } from "@/components/content/florist-card";
import {
  CloseIcon,
  MapPinIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "@/components/ui/icons";
import { ISTANBUL_DISTRICT_OPTIONS } from "@/lib/istanbul-districts";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PublicFlorist } from "@/services/directory";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DirectoryMapProps = {
  mapTitle: string;
};

export function DirectoryMap({ mapTitle }: DirectoryMapProps) {
  const messages = getMessages();
  const t = messages.directory;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [districtSlug, setDistrictSlug] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [items, setItems] = useState<PublicFlorist[]>([]);
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState<IstanbulMapMarker[]>([]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
      window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 60);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 80);
    return () => window.clearTimeout(timer);
  }, [panelOpen, isFullscreen]);

  useEffect(() => {
    if (!districtSlug) {
      setItems([]);
      setMarkers([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    void fetch(
      `/api/public/florists?district=${encodeURIComponent(districtSlug)}&pageSize=48`,
      {
        signal: controller.signal,
        cache: "no-store",
      },
    )
      .then(async (response) => {
        const payload = (await response.json()) as {
          success?: boolean;
          data?: { items?: PublicFlorist[] };
        };
        if (!response.ok || !payload.success || !payload.data?.items) {
          setItems([]);
          setMarkers([]);
          return;
        }
        const nextItems = payload.data.items;
        setItems(nextItems);
        setMarkers(
          nextItems
            .filter(
              (item) =>
                item.latitude != null &&
                item.longitude != null &&
                Number.isFinite(item.latitude) &&
                Number.isFinite(item.longitude),
            )
            .map((item) => ({
              id: item.id,
              title: item.businessName,
              latitude: item.latitude as number,
              longitude: item.longitude as number,
              phone: item.phone,
              address: item.address,
              subtitle: [item.phone, item.address].filter(Boolean).join(" · "),
            })),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setItems([]);
          setMarkers([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [districtSlug]);

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

  const selectDistrict = useCallback((slug: string, name?: string) => {
    setDistrictSlug(slug);
    setDistrictName(
      name ||
        ISTANBUL_DISTRICT_OPTIONS.find((item) => item.slug === slug)?.name ||
        "",
    );
    setPanelOpen(Boolean(slug));
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setDistrictSlug("");
    setDistrictName("");
  }, []);

  const mapMarkers = useMemo(() => markers, [markers]);
  const panelTitle = districtName
    ? t.panelTitle.replace("{district}", districtName)
    : t.title;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden border border-[var(--color-border)] bg-white shadow-[0_18px_40px_rgba(23,35,29,0.06)]",
        isFullscreen
          ? "flex h-screen w-screen flex-col rounded-none"
          : "rounded-[24px]",
      )}
    >
      <div
        className={cn(
          "relative flex",
          isFullscreen ? "min-h-0 flex-1" : "min-h-[420px] lg:min-h-[480px]",
        )}
      >
        <div className="relative min-h-[380px] flex-1 lg:min-h-0">
          <IstanbulMap
            districtSlug={districtSlug}
            markers={mapMarkers}
            onDistrictSelect={(district) =>
              selectDistrict(district.slug, district.name)
            }
            className="absolute inset-0 h-full w-full"
            title={mapTitle}
          />

          <div className="absolute right-4 bottom-4 z-[500] flex items-center gap-2 lg:right-auto lg:left-4">
            <Link
              href={
                districtSlug
                  ? `${routes.florists}?district=${encodeURIComponent(districtSlug)}`
                  : routes.florists
              }
              className="hidden items-center gap-2 rounded-[12px] bg-white/95 px-3 py-2 text-xs text-[var(--color-text-muted)] shadow-sm ring-1 ring-[var(--color-border)] sm:inline-flex"
            >
              <MapPinIcon className="h-4 w-4 text-[var(--color-primary-700)]" />
              <span className="font-semibold text-[var(--color-primary-800)]">
                {t.cta}
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-white/95 px-3.5 text-sm font-semibold text-[var(--color-primary-900)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:bg-white"
              aria-pressed={isFullscreen}
              aria-label={
                isFullscreen ? t.fullscreenExit : t.fullscreenEnter
              }
            >
              {isFullscreen ? (
                <MinimizeIcon className="h-4 w-4" />
              ) : (
                <MaximizeIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isFullscreen ? t.fullscreenExit : t.fullscreenEnter}
              </span>
            </button>
          </div>
        </div>

        <aside
          className={cn(
            "z-[510] flex w-full flex-col border-[var(--color-border)] bg-white transition-all duration-300",
            panelOpen
              ? "absolute inset-y-0 right-0 w-[min(100%,24rem)] border-l shadow-[-12px_0_28px_rgba(23,35,29,0.08)] lg:static lg:w-[24rem] lg:shrink-0 lg:shadow-none"
              : "hidden lg:flex lg:w-[24rem] lg:shrink-0 lg:border-l",
          )}
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
                {t.eyebrow}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                {panelOpen ? panelTitle : t.panelHint}
              </h3>
            </div>
            {panelOpen ? (
              <button
                type="button"
                onClick={closePanel}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]"
                aria-label={t.panelClose}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {!panelOpen ? (
              <p className="rounded-[12px] border border-dashed border-[var(--color-border)] px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">
                {t.panelHint}
              </p>
            ) : loading ? (
              <p className="px-1 py-8 text-center text-sm text-[var(--color-text-muted)]">
                {t.loading}
              </p>
            ) : items.length === 0 ? (
              <p className="rounded-[12px] border border-dashed border-[var(--color-border)] px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">
                {t.panelEmpty}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.id}>
                    <FloristCard
                      item={item}
                      compact
                      showMapButton
                      className="bg-[var(--color-surface-soft)]/50"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {panelOpen && districtSlug ? (
            <div className="border-t border-[var(--color-border)] p-3">
              <Link
                href={`${routes.florists}?district=${encodeURIComponent(districtSlug)}`}
                className="inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] text-sm font-bold text-white hover:bg-[var(--color-primary-700)]"
              >
                {t.panelViewAll}
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
