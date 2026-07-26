/**
 * Shared input format profiles: character filtering, display formatting,
 * length limits, and HTML input attributes.
 *
 * Server-side Zod validation remains authoritative.
 */

export type InputFormatId =
  | "identityNo"
  | "taxNo"
  | "phoneTr"
  | "email"
  | "money"
  | "year"
  | "integer"
  | "sortOrder"
  | "postalCode"
  | "slug"
  | "memberNo"
  | "memberLoginId"
  | "collectionRef"
  | "personName"
  | "title"
  | "address"
  | "addressLong"
  | "url"
  | "username"
  | "password"
  | "search"
  | "note"
  | "version"
  | "providerReference"
  | "plainText"
  | "multiline"
  | "excerpt"
  | "articleBody";

export type InputFormatProfile = {
  id: InputFormatId;
  maxLength: number;
  /** Applied while typing / on paste (may include display separators) */
  filter: (value: string) => string;
  /** Applied on blur — full display / canonical UI format */
  format: (value: string) => string;
  /**
   * Value stored for APIs / Zod (digits-only phone, 1234.56 money, etc.).
   * Defaults to stripping display separators via `toStorageValue`.
   */
  toStorage?: (value: string) => string;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  type?: "text" | "email" | "tel" | "password" | "url" | "search";
  autoComplete?: string;
  spellCheck?: boolean;
  autoCapitalize?: string;
  pattern?: string;
  /** Right-align numeric-looking fields */
  numericAlign?: boolean;
};

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function stripControlChars(value: string) {
  return value.replace(CONTROL_CHARS, "");
}

function collapseSpaces(value: string) {
  return value.replace(/[^\S\n]+/g, " ");
}

function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function filterPersonName(value: string, maxLength: number) {
  return stripControlChars(value)
    .replace(/[^\p{L}\s'’-]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

/** Turkish-aware word capitalization for names */
function formatPersonName(value: string) {
  const trimmed = filterPersonName(value, 120).trim();
  if (!trimmed) return "";
  return trimmed
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => capitalizeTr(part))
          .join("-");
      }
      return capitalizeTr(word);
    })
    .join(" ");
}

function capitalizeTr(word: string) {
  if (!word) return word;
  const lower = word.toLocaleLowerCase("tr-TR");
  return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
}

function filterSlugLive(value: string, maxLength: number) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "")
    .slice(0, maxLength);
}

function formatSlug(value: string) {
  return filterSlugLive(value, 180).replace(/-+$/g, "");
}

/**
 * Parse UI money → number.
 * Preferred display: 1,234.56 (comma thousands, dot decimals).
 * Also accepts legacy TR 1.234,56 and plain 1234.5 / 1234,5.
 */
export function parseMoneyNumber(value: string): number | null {
  const raw = value.trim().replace(/\s/g, "");
  if (!raw) return null;

  let normalized = raw;
  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");
    if (lastDot > lastComma) {
      // 1,234.56 — comma thousands, dot decimal
      normalized = normalized.replace(/,/g, "");
    } else {
      // 1.234,56 — legacy TR
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    }
  } else if (hasComma) {
    const parts = normalized.split(",");
    if (parts.length > 2) {
      // 1,234,567 thousands only
      normalized = normalized.replace(/,/g, "");
    } else if (parts[1] && parts[1].length > 2) {
      // 1,234 thousands
      normalized = normalized.replace(/,/g, "");
    } else {
      // 1234,5 decimal comma (legacy)
      normalized = normalized.replace(",", ".");
    }
  } else if (hasDot) {
    const parts = normalized.split(".");
    if (parts.length > 2) {
      // ambiguous multi-dot: treat as thousands (legacy TR)
      normalized = normalized.replace(/\./g, "");
    }
    // else single dot = decimal
  }

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

/** Canonical storage string for Prisma Decimal: "1234.56" */
export function moneyToStorage(value: string): string {
  const amount = parseMoneyNumber(value);
  if (amount == null) return "";
  return amount.toFixed(2);
}

function groupThousands(intDigits: string) {
  const cleaned = intDigits.replace(/^0+(?=\d)/, "") || (intDigits ? "0" : "");
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Live money typing: decimal ".", thousand ",".
 * Allows trailing "." while entering cents.
 */
function filterMoney(value: string) {
  const next = value.replace(/[^\d.,]/g, "");
  const dotIdx = next.indexOf(".");

  let intRaw = "";
  let fracRaw = "";
  let hasSep = false;
  let trailingSep = false;

  if (dotIdx >= 0) {
    intRaw = next.slice(0, dotIdx).replace(/\D/g, "");
    fracRaw = next.slice(dotIdx + 1).replace(/\D/g, "").slice(0, 2);
    hasSep = true;
    trailingSep = next.endsWith(".") && fracRaw.length === 0;
  } else {
    intRaw = next.replace(/\D/g, "");
  }

  intRaw = intRaw.slice(0, 10);
  if (!intRaw && !hasSep) return "";

  const intFormatted = groupThousands(intRaw || "0");
  if (!hasSep) return intFormatted;
  if (trailingSep) return `${intFormatted}.`;
  if (fracRaw.length > 0) return `${intFormatted}.${fracRaw}`;
  return intFormatted;
}

/** Blur: 1,234.50 */
function formatMoneyDisplay(value: string) {
  const amount = parseMoneyNumber(value);
  if (amount == null) {
    return filterMoney(value);
  }
  const [intPart, fracPart = "00"] = amount.toFixed(2).split(".");
  return `${groupThousands(intPart)}.${fracPart}`;
}

function filterEmail(value: string, maxLength: number) {
  return stripControlChars(value)
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, maxLength);
}

function formatEmail(value: string) {
  return filterEmail(value, 190).trim();
}

function formatPhoneGroups(digits: string) {
  const d = digits.slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  if (d.length <= 9) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
}

/**
 * Digits only national TR phone; always leading 0 when non-empty.
 * Strips +90 / 90 country prefix.
 */
export function normalizePhoneTr(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length >= 12) {
    digits = digits.slice(2);
  }
  if (!digits) return "";
  if (!digits.startsWith("0")) {
    digits = `0${digits}`;
  }
  return digits.slice(0, 11);
}

function filterPhoneTr(value: string) {
  const digits = normalizePhoneTr(value);
  return formatPhoneGroups(digits);
}

function formatPhoneTr(value: string) {
  return formatPhoneGroups(normalizePhoneTr(value));
}

export function isValidPhoneTr(value: string) {
  const digits = normalizePhoneTr(value);
  return /^05\d{9}$/.test(digits) || /^0[2-4]\d{9}$/.test(digits);
}

function formatIdentityGroups(digits: string) {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

function filterIdentityNo(value: string) {
  return formatIdentityGroups(digitsOnly(value, 11));
}

function filterTaxNo(value: string) {
  const d = digitsOnly(value, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 10) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

function filterMemberNo(value: string, maxLength: number) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, maxLength);
}

function filterCollectionRef(value: string, maxLength: number) {
  return stripControlChars(value)
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, maxLength);
}

function filterUrl(value: string, maxLength: number) {
  return stripControlChars(value).replace(/\s+/g, "").slice(0, maxLength);
}

function formatUrl(value: string) {
  const trimmed = filterUrl(value, 255).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  // bare domain or path
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function filterPlain(value: string, maxLength: number) {
  return collapseSpaces(stripControlChars(value)).slice(0, maxLength);
}

function filterMultiline(value: string, maxLength: number) {
  return stripControlChars(value).replace(/\r\n/g, "\n").slice(0, maxLength);
}

function formatIntegerDisplay(value: string) {
  const digits = digitsOnly(value, 10);
  if (!digits) return "";
  return groupThousands(digits);
}

function formatTitle(value: string) {
  return filterPlain(value, 255).trim();
}

function formatAddress(value: string) {
  return filterPlain(value, 255).trim();
}

export const INPUT_FORMATS: Record<InputFormatId, InputFormatProfile> = {
  identityNo: {
    id: "identityNo",
    maxLength: 14,
    filter: filterIdentityNo,
    format: (v) => formatIdentityGroups(digitsOnly(v, 11)),
    toStorage: (v) => digitsOnly(v, 11),
    inputMode: "numeric",
    autoComplete: "off",
    spellCheck: false,
    numericAlign: true,
  },
  taxNo: {
    id: "taxNo",
    maxLength: 14,
    filter: filterTaxNo,
    format: (v) => filterTaxNo(v),
    toStorage: (v) => digitsOnly(v, 11),
    inputMode: "numeric",
    autoComplete: "off",
    spellCheck: false,
    numericAlign: true,
  },
  phoneTr: {
    id: "phoneTr",
    maxLength: 14,
    filter: filterPhoneTr,
    format: formatPhoneTr,
    toStorage: normalizePhoneTr,
    type: "tel",
    inputMode: "tel",
    autoComplete: "tel",
    spellCheck: false,
    numericAlign: false,
  },
  email: {
    id: "email",
    maxLength: 190,
    filter: (v) => filterEmail(v, 190),
    format: formatEmail,
    type: "email",
    inputMode: "email",
    autoComplete: "email",
    spellCheck: false,
  },
  money: {
    id: "money",
    maxLength: 18,
    filter: filterMoney,
    format: formatMoneyDisplay,
    toStorage: moneyToStorage,
    inputMode: "decimal",
    spellCheck: false,
    numericAlign: true,
  },
  year: {
    id: "year",
    maxLength: 4,
    filter: (v) => digitsOnly(v, 4),
    format: (v) => digitsOnly(v, 4),
    inputMode: "numeric",
    spellCheck: false,
    numericAlign: true,
  },
  integer: {
    id: "integer",
    maxLength: 13,
    filter: (v) => formatIntegerDisplay(v),
    format: formatIntegerDisplay,
    toStorage: (v) => digitsOnly(v, 10),
    inputMode: "numeric",
    spellCheck: false,
    numericAlign: true,
  },
  sortOrder: {
    id: "sortOrder",
    maxLength: 4,
    filter: (v) => digitsOnly(v, 4),
    format: (v) => digitsOnly(v, 4),
    inputMode: "numeric",
    spellCheck: false,
    numericAlign: true,
  },
  postalCode: {
    id: "postalCode",
    maxLength: 5,
    filter: (v) => digitsOnly(v, 5),
    format: (v) => digitsOnly(v, 5),
    inputMode: "numeric",
    autoComplete: "postal-code",
    spellCheck: false,
    pattern: "[0-9]{5}",
    numericAlign: true,
  },
  slug: {
    id: "slug",
    maxLength: 180,
    filter: (v) => filterSlugLive(v, 180),
    format: formatSlug,
    autoComplete: "off",
    spellCheck: false,
    autoCapitalize: "none",
    pattern: "[a-z0-9-]*",
  },
  memberNo: {
    id: "memberNo",
    maxLength: 40,
    filter: (v) => filterMemberNo(v, 40),
    format: (v) => filterMemberNo(v, 40),
    autoComplete: "off",
    spellCheck: false,
    autoCapitalize: "characters",
  },
  /** Login field: T.C. (11 digits) or member no (alphanumeric). */
  memberLoginId: {
    id: "memberLoginId",
    maxLength: 40,
    filter: (v) =>
      v
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 40),
    format: (v) =>
      v
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 40),
    autoComplete: "username",
    spellCheck: false,
    autoCapitalize: "characters",
  },
  collectionRef: {
    id: "collectionRef",
    maxLength: 80,
    filter: (v) => filterCollectionRef(v, 80),
    format: (v) => filterCollectionRef(v, 80).trim(),
    autoComplete: "off",
    spellCheck: false,
  },
  personName: {
    id: "personName",
    maxLength: 120,
    filter: (v) => filterPersonName(v, 120),
    format: formatPersonName,
    autoComplete: "name",
    spellCheck: false,
  },
  title: {
    id: "title",
    maxLength: 255,
    filter: (v) => filterPlain(v, 255),
    format: formatTitle,
  },
  address: {
    id: "address",
    maxLength: 255,
    filter: (v) => filterPlain(v, 255),
    format: formatAddress,
    autoComplete: "street-address",
  },
  addressLong: {
    id: "addressLong",
    maxLength: 500,
    filter: (v) => filterMultiline(v, 500),
    format: (v) => filterMultiline(v, 500).trim(),
  },
  url: {
    id: "url",
    maxLength: 255,
    filter: (v) => filterUrl(v, 255),
    format: formatUrl,
    type: "url",
    inputMode: "url",
    autoComplete: "url",
    spellCheck: false,
  },
  username: {
    id: "username",
    maxLength: 80,
    filter: (v) => stripControlChars(v).replace(/\s+/g, "").slice(0, 80),
    format: (v) =>
      stripControlChars(v).replace(/\s+/g, "").trim().slice(0, 80),
    autoComplete: "username",
    spellCheck: false,
  },
  password: {
    id: "password",
    maxLength: 200,
    filter: (v) => stripControlChars(v).slice(0, 200),
    format: (v) => stripControlChars(v).slice(0, 200),
    type: "password",
    autoComplete: "current-password",
    spellCheck: false,
  },
  search: {
    id: "search",
    maxLength: 100,
    filter: (v) => filterPlain(v, 100),
    format: (v) => filterPlain(v, 100).trim(),
    type: "search",
    inputMode: "search",
    autoComplete: "off",
  },
  note: {
    id: "note",
    maxLength: 500,
    filter: (v) => filterMultiline(v, 500),
    format: (v) => filterMultiline(v, 500).trim(),
  },
  version: {
    id: "version",
    maxLength: 40,
    filter: (v) =>
      stripControlChars(v)
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .slice(0, 40),
    format: (v) =>
      stripControlChars(v)
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .trim()
        .slice(0, 40),
    spellCheck: false,
  },
  providerReference: {
    id: "providerReference",
    maxLength: 190,
    filter: (v) => stripControlChars(v).replace(/\s+/g, "").slice(0, 190),
    format: (v) =>
      stripControlChars(v).replace(/\s+/g, "").trim().slice(0, 190),
    spellCheck: false,
  },
  plainText: {
    id: "plainText",
    maxLength: 255,
    filter: (v) => filterPlain(v, 255),
    format: (v) => filterPlain(v, 255).trim(),
  },
  multiline: {
    id: "multiline",
    maxLength: 5000,
    filter: (v) => filterMultiline(v, 5000),
    format: (v) => filterMultiline(v, 5000).trim(),
  },
  excerpt: {
    id: "excerpt",
    maxLength: 2000,
    filter: (v) => filterMultiline(v, 2000),
    format: (v) => filterMultiline(v, 2000).trim(),
  },
  articleBody: {
    id: "articleBody",
    maxLength: 100_000,
    filter: (v) => filterMultiline(v, 100_000),
    format: (v) => filterMultiline(v, 100_000).trim(),
  },
};

export function getInputFormat(id: InputFormatId): InputFormatProfile {
  return INPUT_FORMATS[id];
}

export function applyInputFilter(id: InputFormatId, value: string) {
  return INPUT_FORMATS[id].filter(value);
}

/** Full display format (blur / initial). */
export function applyInputFormat(id: InputFormatId, value: string) {
  return INPUT_FORMATS[id].format(value);
}

/** @deprecated use applyInputFormat */
export function applyInputNormalize(id: InputFormatId, value: string) {
  return applyInputFormat(id, value);
}

/** Canonical value for server actions / Zod */
export function applyInputStorage(id: InputFormatId, value: string) {
  const profile = INPUT_FORMATS[id];
  if (profile.toStorage) return profile.toStorage(value);
  return profile.format(value);
}

/** Legacy helper */
export function digitsOnlyInput(value: string, maxLength: number) {
  return digitsOnly(value, maxLength);
}
