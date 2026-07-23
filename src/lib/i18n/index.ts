import { tr, type Messages } from "@/lib/i18n/messages/tr";

const dictionaries = {
  "tr-TR": tr,
} as const;

export type Locale = keyof typeof dictionaries;

export function getMessages(locale: Locale = "tr-TR"): Messages {
  return dictionaries[locale];
}

export function t(
  messages: Messages,
  path: string,
  vars?: Record<string, string | number>,
): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, messages);

  if (typeof value !== "string") {
    return path;
  }

  if (!vars) {
    return value;
  }

  return Object.entries(vars).reduce(
    (text, [key, replacement]) =>
      text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}
