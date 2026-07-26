import { z } from "zod";
import type { ContentStatus, PostType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  homeNewsTabToType,
  type HomeNewsItemDto,
  type HomeNewsTab,
} from "@/lib/home-news";
import { sanitizeArticleHtml } from "@/lib/html-sanitize";
import { resolveEntitySlug } from "@/lib/resolve-slug";

export type { HomeNewsTab };

export const postTypeSchema = z.enum(["news", "announcement", "sector"]);
export const contentStatusSchema = z.enum([
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
]);

export const postInputSchema = z.object({
  type: postTypeSchema,
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().max(2000).optional().nullable(),
  content: z
    .string()
    .trim()
    .max(100_000)
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const clean = sanitizeArticleHtml(value);
      return clean || null;
    }),
  coverImage: z.string().trim().max(500).optional().nullable(),
  status: contentStatusSchema.default("draft"),
  featured: z.boolean().default(false),
  seoTitle: z.string().trim().max(255).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export type PostInput = z.infer<typeof postInputSchema>;

function parseOptionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function isPostSlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.post.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function resolvePostSlug(
  provided: string | null | undefined,
  title: string,
  excludeId?: string,
) {
  return resolveEntitySlug({
    provided,
    fromTitle: title,
    emptyFallback: "icerik",
    isTaken: (slug) => isPostSlugTaken(slug, excludeId),
  });
}

async function nextFeaturedSortOrder(excludeId?: string) {
  const last = await prisma.post.findFirst({
    where: {
      deletedAt: null,
      featured: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

async function reindexFeaturedPosts() {
  const rows = await prisma.post.findMany({
    where: { deletedAt: null, featured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { id: "asc" }],
    select: { id: true },
  });

  if (rows.length === 0) return;

  await prisma.$transaction(
    rows.map((row, sortOrder) =>
      prisma.post.update({
        where: { id: row.id },
        data: { sortOrder },
      }),
    ),
  );
}

export async function listPosts(filters?: {
  type?: PostType;
  status?: ContentStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
  const where = {
    deletedAt: null as Date | null,
    ...(filters?.type ? { type: filters.type } : {}),
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.q
      ? {
          OR: [
            { title: { contains: filters.q } },
            { slug: { contains: filters.q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { sortOrder: "asc" },
        { updatedAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function getPostById(id: string) {
  return prisma.post.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function createPost(raw: PostInput) {
  const input = postInputSchema.parse(raw);
  const slug = await resolvePostSlug(input.slug, input.title);

  const publishedAt =
    input.status === "published"
      ? (parseOptionalDate(input.publishedAt) ?? new Date())
      : parseOptionalDate(input.publishedAt);

  const sortOrder = input.featured ? await nextFeaturedSortOrder() : 0;

  return prisma.post.create({
    data: {
      type: input.type,
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content: input.content || null,
      coverImage: input.coverImage || null,
      status: input.status,
      featured: input.featured,
      sortOrder,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt,
      expiresAt: parseOptionalDate(input.expiresAt),
    },
  });
}

export async function updatePost(id: string, raw: PostInput) {
  const existing = await getPostById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const input = postInputSchema.parse(raw);
  const slug = await resolvePostSlug(input.slug, input.title, id);

  let publishedAt = parseOptionalDate(input.publishedAt);
  if (input.status === "published" && !publishedAt) {
    publishedAt = existing.publishedAt ?? new Date();
  }

  let sortOrder = existing.sortOrder;
  if (input.featured && !existing.featured) {
    sortOrder = await nextFeaturedSortOrder(id);
  } else if (!input.featured && existing.featured) {
    sortOrder = 0;
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      type: input.type,
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content: input.content || null,
      coverImage: input.coverImage || null,
      status: input.status,
      featured: input.featured,
      sortOrder,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt,
      expiresAt: parseOptionalDate(input.expiresAt),
    },
  });

  if (!input.featured && existing.featured) {
    await reindexFeaturedPosts();
  }

  return updated;
}

export async function softDeletePost(id: string) {
  const existing = await getPostById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  return prisma.post.update({
    where: { id },
    data: { deletedAt: new Date(), status: "archived" },
  });
}

export async function setPostFeatured(id: string, featured: boolean) {
  const existing = await getPostById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (existing.featured === featured) {
    return existing;
  }

  if (featured) {
    return prisma.post.update({
      where: { id },
      data: {
        featured: true,
        sortOrder: await nextFeaturedSortOrder(id),
      },
    });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { featured: false, sortOrder: 0 },
  });
  await reindexFeaturedPosts();
  return updated;
}

export async function movePostSort(id: string, direction: "up" | "down") {
  const rows = await prisma.post.findMany({
    where: { deletedAt: null, featured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { id: "asc" }],
    select: { id: true },
  });

  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) {
    throw new Error("NOT_FOUND");
  }

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) {
    return { moved: false as const };
  }

  const ordered = [...rows];
  const current = ordered[index]!;
  ordered[index] = ordered[target]!;
  ordered[target] = current;

  await prisma.$transaction(
    ordered.map((row, sortOrder) =>
      prisma.post.update({
        where: { id: row.id },
        data: { sortOrder },
      }),
    ),
  );

  return { moved: true as const };
}

const publicPostSelect = {
  id: true,
  type: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  featured: true,
  publishedAt: true,
  seoTitle: true,
  seoDescription: true,
} as const;

export function publishedPostWhere(now = new Date()) {
  return {
    deletedAt: null as Date | null,
    status: "published" as const,
    AND: [
      {
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    ],
  };
}

export async function listPublishedPosts(filters?: {
  type?: PostType | PostType[];
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 12));
  const now = new Date();
  const types = filters?.type
    ? Array.isArray(filters.type)
      ? filters.type
      : [filters.type]
    : undefined;

  const where = {
    ...publishedPostWhere(now),
    ...(types?.length === 1
      ? { type: types[0] }
      : types?.length
        ? { type: { in: types } }
        : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: publicPostSelect,
    }),
    prisma.post.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function getPublishedPostBySlug(slug: string) {
  if (!slug) return null;
  const now = new Date();
  return prisma.post.findFirst({
    where: {
      slug,
      ...publishedPostWhere(now),
    },
  });
}

export async function listRelatedPublishedPosts(
  postId: string,
  type: PostType,
  limit = 3,
) {
  const now = new Date();
  return prisma.post.findMany({
    where: {
      ...publishedPostWhere(now),
      type,
      NOT: { id: postId },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: Math.max(1, Math.min(6, limit)),
    select: publicPostSelect,
  });
}

const adjacentPostSelect = {
  title: true,
  slug: true,
  type: true,
} as const;

/** Older / newer published posts in the same type for detail navigation. */
export async function getAdjacentPublishedPosts(
  postId: string,
  type: PostType,
  publishedAt: Date | null,
) {
  if (!publishedAt) {
    return { previous: null, next: null };
  }

  const now = new Date();
  const base = {
    ...publishedPostWhere(now),
    type,
    NOT: { id: postId },
  };

  const [previous, next] = await Promise.all([
    prisma.post.findFirst({
      where: { ...base, publishedAt: { lt: publishedAt } },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      select: adjacentPostSelect,
    }),
    prisma.post.findFirst({
      where: { ...base, publishedAt: { gt: publishedAt } },
      orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
      select: adjacentPostSelect,
    }),
  ]);

  return { previous, next };
}

export async function listFeaturedPostIds() {
  const rows = await prisma.post.findMany({
    where: { deletedAt: null, featured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { id: "asc" }],
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function getHomeNewsFeed(
  limit = 4,
  tab: HomeNewsTab = "all",
) {
  const now = new Date();
  const type = homeNewsTabToType(tab);

  return prisma.post.findMany({
    where: {
      ...publishedPostWhere(now),
      featured: true,
      ...(type ? { type } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { id: "asc" }],
    take: Math.max(1, Math.min(12, limit)),
    select: publicPostSelect,
  });
}

export function serializeHomeNewsItem(row: {
  id: string;
  type: PostType;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
}): HomeNewsItemDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function listPublishedPostSlugs() {
  const now = new Date();
  return prisma.post.findMany({
    where: publishedPostWhere(now),
    select: { slug: true, type: true, updatedAt: true },
    orderBy: [{ publishedAt: "desc" }],
  });
}
