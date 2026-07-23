const SITE_SUFFIX = " | İstanbul Çiçekçiler Esnaf Odası";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function buildSeoTitle(title: string) {
  const clean = collapseWhitespace(title);
  if (!clean) return "";
  const max = 60;
  if (clean.length + SITE_SUFFIX.length <= max) {
    return `${clean}${SITE_SUFFIX}`;
  }
  return clean.slice(0, max).trim();
}

export function buildSeoDescription(excerpt: string, content: string) {
  const fromExcerpt = collapseWhitespace(excerpt);
  if (fromExcerpt) {
    return fromExcerpt.slice(0, 160);
  }

  const fromContent = collapseWhitespace(content.replace(/<[^>]+>/g, " "));
  if (!fromContent) return "";
  return fromContent.slice(0, 160);
}
