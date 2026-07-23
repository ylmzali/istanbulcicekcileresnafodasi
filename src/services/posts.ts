import { z } from "zod";
import type { ContentStatus, PostType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { slugify, slugSchema } from "@/lib/slug";

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
  content: z.string().trim().optional().nullable(),
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

async function uniquePostSlug(base: string, excludeId?: string) {
  const validated = slugSchema.parse(base || "icerik");
  let candidate = validated;
  let index = 2;

  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${validated}-${index}`;
    index += 1;
  }
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
      orderBy: [{ updatedAt: "desc" }],
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
  const slug = await uniquePostSlug(
    input.slug?.trim() ? slugify(input.slug) : slugify(input.title),
  );

  const publishedAt =
    input.status === "published"
      ? (parseOptionalDate(input.publishedAt) ?? new Date())
      : parseOptionalDate(input.publishedAt);

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
  const slug = await uniquePostSlug(
    input.slug?.trim() ? slugify(input.slug) : slugify(input.title),
    id,
  );

  let publishedAt = parseOptionalDate(input.publishedAt);
  if (input.status === "published" && !publishedAt) {
    publishedAt = existing.publishedAt ?? new Date();
  }

  return prisma.post.update({
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
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      publishedAt,
      expiresAt: parseOptionalDate(input.expiresAt),
    },
  });
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
