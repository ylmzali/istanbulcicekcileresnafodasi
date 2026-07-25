import "server-only";

import type { PostType } from "@/generated/prisma/client";
import { postHref } from "@/lib/content-paths";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/routes";
import { publishedPostWhere } from "@/services/posts";

export type SearchResultItem = {
  id: string;
  kind: "post" | "faq";
  title: string;
  excerpt: string;
  href: string;
  meta: string;
};

function truncate(value: string, max = 160) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export async function searchPublicContent(query: string): Promise<{
  q: string;
  items: SearchResultItem[];
  counts: { posts: number; faqs: number; total: number };
}> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) {
    return { q, items: [], counts: { posts: 0, faqs: 0, total: 0 } };
  }

  const now = new Date();
  const [posts, faqs] = await Promise.all([
    prisma.post.findMany({
      where: {
        ...publishedPostWhere(now),
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { content: { contains: q } },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        excerpt: true,
        slug: true,
      },
    }),
    prisma.faq.findMany({
      where: {
        status: "published",
        OR: [{ question: { contains: q } }, { answer: { contains: q } }],
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      take: 20,
      select: {
        id: true,
        question: true,
        answer: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const postTypeLabel: Record<PostType, string> = {
    news: "Oda haberi",
    announcement: "Duyuru",
    sector: "Sektörden",
  };

  const postItems: SearchResultItem[] = posts.map((post) => ({
    id: post.id,
    kind: "post",
    title: post.title,
    excerpt: truncate(post.excerpt || ""),
    href: postHref(post.type, post.slug),
    meta: postTypeLabel[post.type],
  }));

  const faqItems: SearchResultItem[] = faqs.map((faq) => ({
    id: faq.id,
    kind: "faq",
    title: faq.question,
    excerpt: truncate(faq.answer),
    href: `${routes.faq}#${faq.id}`,
    meta: faq.category?.name ? `SSS · ${faq.category.name}` : "SSS",
  }));

  const items = [...postItems, ...faqItems];

  return {
    q,
    items,
    counts: {
      posts: postItems.length,
      faqs: faqItems.length,
      total: items.length,
    },
  };
}
