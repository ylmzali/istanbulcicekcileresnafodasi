import { z } from "zod";

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  I: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/** ASCII kebab-case: `a-z`, `0-9`, hyphen only. No spaces, Turkish letters, or punctuation. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Asset basename + lowercase extension, e.g. `hero-experience-badge.png`. */
export const ASSET_FILENAME_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/;

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(SLUG_PATTERN, "Slug yalnızca küçük harf, rakam ve tire içerebilir.");

export const assetFilenameSchema = z
  .string()
  .trim()
  .min(3)
  .max(180)
  .regex(
    ASSET_FILENAME_PATTERN,
    "Dosya adı yalnızca küçük harf, rakam, tire ve uzantı içerebilir.",
  );

function transliterateTurkish(value: string) {
  return value.replace(
    /[çÇğĞıİIöÖşŞüÜ]/g,
    (char) => TURKISH_CHAR_MAP[char] ?? char,
  );
}

/**
 * Turns free text into a URL/file slug.
 * Example: `70 Yıllık Tecrübe!` → `70-yillik-tecrube`
 */
export function slugify(
  value: string,
  options?: { maxLength?: number },
): string {
  const maxLength = options?.maxLength ?? 180;

  const slug = transliterateTurkish(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");

  return slug;
}

export function isValidSlug(value: string) {
  return SLUG_PATTERN.test(value);
}

/**
 * Safe public asset filename from a display name or upload name.
 * Example: `Hero Rozeti (Yeni).PNG` → `hero-rozeti-yeni.png`
 */
export function slugifyAssetFilename(
  filename: string,
  options?: { maxLength?: number },
): string {
  const trimmed = filename.trim();
  const lastDot = trimmed.lastIndexOf(".");
  const hasExtension = lastDot > 0 && lastDot < trimmed.length - 1;

  const base = hasExtension ? trimmed.slice(0, lastDot) : trimmed;
  const extension = hasExtension
    ? slugify(trimmed.slice(lastDot + 1), { maxLength: 12 })
    : "";

  const safeBase = slugify(base, {
    maxLength: options?.maxLength ?? 160,
  });

  if (!safeBase) {
    return extension ? `file.${extension}` : "file";
  }

  return extension ? `${safeBase}.${extension}` : safeBase;
}

export function isValidAssetFilename(value: string) {
  return ASSET_FILENAME_PATTERN.test(value);
}
