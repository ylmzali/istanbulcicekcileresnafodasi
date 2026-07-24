import { siteConfig } from "@/lib/site";

const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  timeZone: siteConfig.timeZone,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const monthShortFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  timeZone: siteConfig.timeZone,
  month: "short",
});

const dayFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  timeZone: siteConfig.timeZone,
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  timeZone: siteConfig.timeZone,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
}

export function formatTime(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return timeFormatter.format(date);
}

export function formatEventDayParts(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return {
    day: dayFormatter.format(date),
    month: monthShortFormatter.format(date).replace(".", ""),
  };
}

/** Rough reading time for plain-text articles (~200 wpm, Turkish). */
export function estimateReadingMinutes(
  ...parts: Array<string | null | undefined>
) {
  const words = parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / 200));
}
