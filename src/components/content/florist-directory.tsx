"use client";

import { useMemo, useState } from "react";
import { FloristCard } from "@/components/content/florist-card";
import {
  IstanbulMap,
  type IstanbulMapMarker,
} from "@/components/home/istanbul-map";
import { SearchIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { ISTANBUL_DISTRICT_OPTIONS } from "@/lib/istanbul-districts";
import { getMessages } from "@/lib/i18n";
import type { PublicFlorist } from "@/services/directory";

type FloristDirectoryProps = {
  initialItems: PublicFlorist[];
  initialTotal: number;
  initialQ?: string;
  initialDistrict?: string;
};

export function FloristDirectory({
  initialItems,
  initialTotal,
  initialQ = "",
  initialDistrict = "",
}: FloristDirectoryProps) {
  const t = getMessages().directory;
  const [q, setQ] = useState(initialQ);
  const [district, setDistrict] = useState(initialDistrict);
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const markers: IstanbulMapMarker[] = useMemo(
    () =>
      items
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
          subtitle: [
            item.districtName,
            item.phone,
            item.address,
          ]
            .filter(Boolean)
            .join(" · "),
        })),
    [items],
  );

  async function runSearch(nextQ = q, nextDistrict = district) {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ pageSize: "48" });
      if (nextQ.trim()) params.set("q", nextQ.trim());
      if (nextDistrict) params.set("district", nextDistrict);
      const response = await fetch(`/api/public/florists?${params}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { items: PublicFlorist[]; total: number };
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error("fetch_failed");
      }
      setItems(payload.data.items);
      setTotal(payload.data.total);
    } catch {
      setItems([]);
      setTotal(0);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-white">
        <div className="relative min-h-[320px] lg:min-h-[420px]">
          <IstanbulMap
            districtSlug={district}
            markers={markers}
            className="absolute inset-0 h-full w-full"
            title={t.title}
            onDistrictSelect={(selected) => {
              setDistrict(selected.slug);
              void runSearch(q, selected.slug);
            }}
          />
        </div>
      </div>

      <form
        className="rounded-[16px] border border-[var(--color-border)] bg-white p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch();
        }}
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
          <label className="sr-only" htmlFor="florist-district">
            {t.district}
          </label>
          <select
            id="florist-district"
            value={district}
            onChange={(event) => {
              const value = event.target.value;
              setDistrict(value);
              void runSearch(q, value);
            }}
            className="h-11 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-sm"
          >
            <option value="">{t.district}</option>
            {ISTANBUL_DISTRICT_OPTIONS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="florist-q">
            {t.search}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              id="florist-q"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={t.search}
              className="h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-white pr-3 pl-9 text-sm"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)]"
          >
            <SearchIcon className="h-4 w-4" />
            {t.submit}
          </button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-muted)] sm:text-sm">
          <ShieldCheckIcon className="h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
          {t.trustNote}
        </p>
      </form>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-muted)]">
          {loading
            ? t.loading
            : t.resultsCount.replace("{count}", String(total))}
        </p>
      </div>

      {error ? (
        <p className="rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[var(--color-accent)]">
          {t.loadError}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-[var(--color-border)] bg-white px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
          {t.empty}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <FloristCard item={item} showMapButton />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
