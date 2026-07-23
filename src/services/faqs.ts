import { z } from "zod";
import type { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { slugify, slugSchema } from "@/lib/slug";
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

async function uniqueFaqCategorySlug(base: string, excludeId?: string) {
  const validated = slugSchema.parse(base || "sss");
  let candidate = validated;
  let index = 2;

  while (true) {
    const existing = await prisma.faqCategory.findFirst({
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
  const slug = await uniqueFaqCategorySlug(
    input.slug?.trim() ? slugify(input.slug) : slugify(input.name),
  );

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
