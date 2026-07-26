import {
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PublicFlorist } from "@/services/directory";

function websiteHref(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function mapHref(item: PublicFlorist) {
  if (
    item.latitude != null &&
    item.longitude != null &&
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude)
  ) {
    return `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
  }

  const query = [item.businessName, item.address, item.districtName, "İstanbul"]
    .filter(Boolean)
    .join(", ");
  if (!query.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

type FloristCardProps = {
  item: PublicFlorist;
  compact?: boolean;
  className?: string;
  showMapButton?: boolean;
};

export function FloristCard({
  item,
  compact = false,
  className,
  showMapButton = false,
}: FloristCardProps) {
  const t = getMessages().directory;
  const showLegalName =
    Boolean(item.tradeName) &&
    item.legalName.toLocaleLowerCase("tr-TR") !==
      item.tradeName!.toLocaleLowerCase("tr-TR");
  const mapUrl = showMapButton ? mapHref(item) : null;

  return (
    <article
      className={cn(
        "rounded-[14px] border border-[var(--color-border)] bg-white",
        compact ? "px-3 py-3" : "p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4
            className={cn(
              "font-semibold text-[var(--color-text)]",
              compact ? "text-sm" : "text-base",
            )}
          >
            {item.businessName}
          </h4>
          {showLegalName ? (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {t.legalName}: {item.legalName}
            </p>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--color-primary-100)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary-800)]">
          <ShieldCheckIcon className="h-3 w-3" />
          {t.verifiedBadge}
        </span>
      </div>

      {item.districtName ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-primary-700)]">
          {item.districtName}
        </p>
      ) : null}

      {item.categories.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1">
          {item.categories.map((category) => (
            <li
              key={category}
              className="rounded-md bg-[var(--color-surface-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]"
            >
              {category}
            </li>
          ))}
        </ul>
      ) : null}

      {item.description ? (
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-[var(--color-text-muted)]",
            compact ? "line-clamp-3" : "line-clamp-4",
          )}
        >
          {item.description}
        </p>
      ) : null}

      <dl className="mt-3 space-y-2 text-xs text-[var(--color-text-muted)]">
        {item.address ? (
          <div className="flex items-start gap-1.5">
            <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary-700)]" />
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {t.address}
              </dt>
              <dd className="mt-0.5 leading-5 text-[var(--color-text)]">
                {item.address}
              </dd>
            </div>
          </div>
        ) : null}
        {item.phone ? (
          <div className="flex items-start gap-1.5">
            <PhoneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary-700)]" />
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                {t.phone}
              </dt>
              <dd className="mt-0.5">
                <a
                  href={`tel:${item.phone.replace(/\s/g, "")}`}
                  className="font-medium text-[var(--color-primary-800)] hover:underline"
                >
                  {item.phone}
                </a>
              </dd>
            </div>
          </div>
        ) : null}
        {item.email ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              {t.email}
            </dt>
            <dd className="mt-0.5">
              <a
                href={`mailto:${item.email}`}
                className="font-medium break-all text-[var(--color-primary-800)] hover:underline"
              >
                {item.email}
              </a>
            </dd>
          </div>
        ) : null}
        {item.website ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              {t.website}
            </dt>
            <dd className="mt-0.5">
              <a
                href={websiteHref(item.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium break-all text-[var(--color-primary-800)] hover:underline"
              >
                {item.website.replace(/^https?:\/\//i, "")}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {mapUrl ? (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] border border-[var(--color-border)] bg-white text-xs font-semibold text-[var(--color-primary-800)] transition hover:bg-[var(--color-surface-soft)]"
        >
          <MapPinIcon className="h-3.5 w-3.5" />
          {t.openOnMap}
        </a>
      ) : null}
    </article>
  );
}
