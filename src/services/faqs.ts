import { z } from "zod";
import type { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { resolveEntitySlug } from "@/lib/resolve-slug";
import { contentStatusSchema } from "@/services/posts";

export const faqCategoryInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const faqInputSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1),
  categoryId: z.string().trim().optional().nullable(),
  status: contentStatusSchema.default("draft"),
  sortOrder: z.coerce.number().int().default(0),
});

export type FaqInput = z.infer<typeof faqInputSchema>;
export type FaqCategoryInput = z.infer<typeof faqCategoryInputSchema>;

async function isFaqCategorySlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.faqCategory.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function resolveFaqCategorySlug(
  provided: string | null | undefined,
  name: string,
  excludeId?: string,
) {
  return resolveEntitySlug({
    provided,
    fromTitle: name,
    emptyFallback: "sss",
    isTaken: (slug) => isFaqCategorySlugTaken(slug, excludeId),
  });
}

export async function listFaqCategories() {
  return prisma.faqCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { faqs: true } } },
  });
}

export async function listFaqs(filters?: {
  status?: ContentStatus;
  categoryId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
  const where = {
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters?.q
      ? {
          OR: [
            { question: { contains: filters.q } },
            { answer: { contains: filters.q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.faq.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.faq.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function getFaqById(id: string) {
  return prisma.faq.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createFaqCategory(raw: FaqCategoryInput) {
  const input = faqCategoryInputSchema.parse(raw);
  const slug = await resolveFaqCategorySlug(input.slug, input.name);

  return prisma.faqCategory.create({
    data: {
      name: input.name,
      slug,
      sortOrder: input.sortOrder,
    },
  });
}

export async function createFaq(raw: FaqInput) {
  const input = faqInputSchema.parse(raw);

  return prisma.faq.create({
    data: {
      question: input.question,
      answer: input.answer,
      categoryId: input.categoryId || null,
      status: input.status,
      sortOrder: input.sortOrder,
    },
  });
}

export async function updateFaq(id: string, raw: FaqInput) {
  const existing = await getFaqById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const input = faqInputSchema.parse(raw);

  return prisma.faq.update({
    where: { id },
    data: {
      question: input.question,
      answer: input.answer,
      categoryId: input.categoryId || null,
      status: input.status,
      sortOrder: input.sortOrder,
    },
  });
}

export async function deleteFaq(id: string) {
  const existing = await getFaqById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  return prisma.faq.delete({ where: { id } });
}

export type PublishedFaq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  category: { id: string; name: string; slug: string } | null;
};

export async function listPublishedFaqs(options?: {
  limit?: number;
  categorySlug?: string;
}): Promise<PublishedFaq[]> {
  const limit = Math.min(100, Math.max(1, options?.limit ?? 50));

  return prisma.faq.findMany({
    where: {
      status: "published",
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug } }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      question: true,
      answer: true,
      sortOrder: true,
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export type PublishedFaqGroup = {
  category: { id: string; name: string; slug: string } | null;
  items: PublishedFaq[];
};

export async function listPublishedFaqGroups(): Promise<{
  items: PublishedFaq[];
  groups: PublishedFaqGroup[];
  categories: Array<{ id: string; name: string; slug: string; count: number }>;
}> {
  const items = await listPublishedFaqs({ limit: 100 });

  const categoryMap = new Map<
    string,
    { id: string; name: string; slug: string; count: number }
  >();
  const uncategorized: PublishedFaq[] = [];
  const byCategory = new Map<string, PublishedFaq[]>();

  for (const item of items) {
    if (!item.category) {
      uncategorized.push(item);
      continue;
    }
    const key = item.category.id;
    const bucket = byCategory.get(key) ?? [];
    bucket.push(item);
    byCategory.set(key, bucket);

    const existing = categoryMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(key, {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        count: 1,
      });
    }
  }

  const categories = [...categoryMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "tr"),
  );

  const groups: PublishedFaqGroup[] = [
    ...categories.map((category) => ({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      items: byCategory.get(category.id) ?? [],
    })),
  ];

  if (uncategorized.length > 0) {
    groups.push({ category: null, items: uncategorized });
  }

  return { items, groups, categories };
}
