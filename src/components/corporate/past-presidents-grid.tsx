import Image from "next/image";
import type { PastPresident } from "@/lib/corporate/content";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}

export function PastPresidentsGrid({
  presidents,
}: {
  presidents: PastPresident[];
}) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {presidents.map((president) => (
        <article
          key={president.id}
          className="flex flex-col overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-soft)]"
        >
          <div className="relative aspect-[4/5] bg-white">
            {president.imageSrc ? (
              <Image
                src={president.imageSrc}
                alt={`${president.name} portresi`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 40vw, 280px"
                className="object-contain object-center p-3"
              />
            ) : (
              <span
                aria-hidden
                className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[var(--color-primary-800)]"
              >
                {initials(president.name)}
              </span>
            )}
          </div>
          <div className="border-t border-[var(--color-border)] bg-white px-4 py-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
              {president.fromYear}–{president.toYear}
            </p>
            <h2 className="mt-1.5 text-lg font-semibold text-[var(--color-primary-900)]">
              {president.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Geçmiş dönem oda başkanı
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
