import { slugify, slugSchema } from "@/lib/slug";

export const SLUG_TAKEN = "SLUG_TAKEN";
export const SLUG_INVALID = "SLUG_INVALID";

export function isSlugError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.message === SLUG_TAKEN || error.message === SLUG_INVALID)
  );
}

export function slugErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  if (error.message === SLUG_TAKEN) {
    return "Bu slug daha önce kullanılmış. Farklı bir slug girin.";
  }
  if (error.message === SLUG_INVALID) {
    return "Slug geçersiz. Yalnızca küçük harf, rakam ve tire kullanın.";
  }
  return fallback;
}

/**
 * Resolves a URL slug for create/update:
 * - Provided slug: format-check + reject if already taken in DB
 * - Empty slug: derive from title, then append -2, -3… until free
 */
export async function resolveEntitySlug(params: {
  provided?: string | null;
  fromTitle: string;
  emptyFallback: string;
  isTaken: (slug: string) => Promise<boolean>;
}): Promise<string> {
  const raw = params.provided?.trim();

  if (raw) {
    const candidate = slugify(raw);
    const parsed = slugSchema.safeParse(candidate);
    if (!parsed.success) {
      throw new Error(SLUG_INVALID);
    }
    if (await params.isTaken(parsed.data)) {
      throw new Error(SLUG_TAKEN);
    }
    return parsed.data;
  }

  const base = slugify(params.fromTitle) || params.emptyFallback;
  const parsed = slugSchema.safeParse(base);
  if (!parsed.success) {
    throw new Error(SLUG_INVALID);
  }

  let candidate = parsed.data;
  let index = 2;
  while (await params.isTaken(candidate)) {
    const next = `${parsed.data}-${index}`;
    const nextParsed = slugSchema.safeParse(next);
    if (!nextParsed.success) {
      throw new Error(SLUG_INVALID);
    }
    candidate = nextParsed.data;
    index += 1;
    if (index > 1000) {
      throw new Error(SLUG_TAKEN);
    }
  }

  return candidate;
}
