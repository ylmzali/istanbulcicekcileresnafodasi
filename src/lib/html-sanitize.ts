import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "hr",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title", "class"];

/** Strip tags for SEO / reading-time plain text. */
export function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/** Convert legacy plain-text body into simple HTML paragraphs. */
export function plainTextToHtml(value: string) {
  const parts = value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function sanitizeArticleHtml(dirty: string | null | undefined) {
  if (!dirty?.trim()) return "";

  const source = looksLikeHtml(dirty) ? dirty : plainTextToHtml(dirty);

  const clean = DOMPurify.sanitize(source, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  }).trim();

  if (
    !clean ||
    clean === "<p></p>" ||
    clean === "<p><br></p>" ||
    clean === "<p><br/></p>"
  ) {
    return "";
  }

  return clean;
}

/** Ensure external links open safely. */
export function sanitizeArticleHtmlForDisplay(dirty: string | null | undefined) {
  const clean = sanitizeArticleHtml(dirty);
  if (!clean) return "";

  return DOMPurify.sanitize(clean, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target", "rel"],
    FORCE_BODY: true,
  })
    .replace(
      /<a\s+([^>]*href=(?:"[^"]*"|'[^']*')[^>]*)>/gi,
      (match, attrs: string) => {
        if (/\brel=/i.test(attrs)) return match;
        return `<a ${attrs} rel="noopener noreferrer">`;
      },
    )
    .trim();
}
