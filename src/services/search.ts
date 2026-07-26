import "server-only";

import type { PostType } from "@/generated/prisma/client";
import { eventHref, postHref } from "@/lib/content-paths";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/routes";
import { publishedPostWhere } from "@/services/posts";
import { resourceDownloadHref } from "@/services/resources";

export type SearchResultKind = "post" | "faq" | "event" | "resource";

export type SearchResultItem = {
  id: string;
  kind: SearchResultKind;
  title: string;
  excerpt: string;
  href: string;
  meta: string;
};

function truncate(value: string, max = 140) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export async function searchPublicContent(query: string): Promise<{
  q: string;
  items: SearchResultItem[];
  counts: {
    posts: number;
    faqs: number;
    events: number;
    resources: number;
    total: number;
  };
}> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) {
    return {
      q,
      items: [],
      counts: { posts: 0, faqs: 0, events: 0, resources: 0, total: 0 },
    };
  }

  const now = new Date();
  const [posts, faqs, events, resources] = await Promise.all([
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
      take: 8,
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
      take: 6,
      select: {
        id: true,
        question: true,
        answer: true,
        category: { select: { name: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        status: "published",
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { location: { contains: q } },
        ],
      },
      orderBy: [{ startsAt: "desc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        location: true,
      },
    }),
    prisma.resource.findMany({
      where: {
        deletedAt: null,
        visibility: "public",
        publishedAt: { lte: now },
        OR: [
          { title: { contains: q } },
          { category: { contains: q } },
          { version: { contains: q } },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        category: true,
        version: true,
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

  const eventItems: SearchResultItem[] = events.map((event) => ({
    id: event.id,
    kind: "event",
    title: event.title,
    excerpt: truncate(event.description || event.location || ""),
    href: eventHref(event.slug),
    meta: "Etkinlik / eğitim",
  }));

  const resourceItems: SearchResultItem[] = resources.map((resource) => ({
    id: resource.id,
    kind: "resource",
    title: resource.title,
    excerpt: [resource.category, resource.version].filter(Boolean).join(" · "),
    href: resourceDownloadHref(resource.id),
    meta: "Mevzuat / kaynak",
  }));

  const items = [
    ...postItems,
    ...eventItems,
    ...resourceItems,
    ...faqItems,
  ];

  return {
    q,
    items,
    counts: {
      posts: postItems.length,
      faqs: faqItems.length,
      events: eventItems.length,
      resources: resourceItems.length,
      total: items.length,
    },
  };
}
