import { z } from "zod";
import type { Prisma, ResourceVisibility } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { resolveEntitySlug } from "@/lib/resolve-slug";

export const resourceVisibilitySchema = z.enum(["public", "members", "staff"]);

export const resourceCreateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().max(180).optional().nullable(),
  category: z.string().trim().max(120).optional().nullable(),
  version: z.string().trim().max(40).optional().nullable(),
  visibility: resourceVisibilitySchema.default("public"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  publishedAt: z.string().optional().nullable(),
  fileKey: z.string().trim().min(1).max(500),
  fileSize: z.coerce.number().int().min(1).optional().nullable(),
  mimeType: z.string().trim().max(120).optional().nullable(),
});

export const resourceUpdateSchema = resourceCreateSchema.extend({
  fileKey: z.string().trim().min(1).max(500).optional().or(z.literal("")),
});

export type ResourceCreateInput = z.infer<typeof resourceCreateSchema>;
export type ResourceUpdateInput = z.infer<typeof resourceUpdateSchema>;

export type PublicResourceItem = {
  id: string;
  title: string;
  category: string | null;
  version: string | null;
  fileSize: number | null;
  mimeType: string | null;
  publishedAt: Date | null;
  downloadHref: string;
};

function parseOptionalDate(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateInputValue(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

async function isResourceSlugTaken(slug: string, excludeId?: string | null) {
  const existing = await prisma.resource.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

function publicWhere(): Prisma.ResourceWhereInput {
  const now = new Date();
  return {
    deletedAt: null,
    visibility: "public",
    publishedAt: { lte: now },
  };
}

export function resourceDownloadHref(id: string) {
  return `/api/public/resources/${id}/download`;
}

export async function listPublicResources(limit = 5): Promise<PublicResourceItem[]> {
  const rows = await prisma.resource.findMany({
    where: publicWhere(),
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { title: "asc" }],
    take: Math.min(50, Math.max(1, limit)),
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    version: row.version,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    publishedAt: row.publishedAt,
    downloadHref: resourceDownloadHref(row.id),
  }));
}

export async function listPublicResourceCategories() {
  const rows = await prisma.resource.findMany({
    where: {
      ...publicWhere(),
      category: { not: null },
    },
    select: { category: true },
    orderBy: { category: "asc" },
  });

  const names = new Set<string>();
  for (const row of rows) {
    const name = row.category?.trim();
    if (name) names.add(name);
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, "tr"));
}

export async function listPublicResourcesPage(filters?: {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters?.pageSize ?? 20));
  const q = filters?.q?.trim();
  const category = filters?.category?.trim();

  const where: Prisma.ResourceWhereInput = {
    ...publicWhere(),
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { version: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { title: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      version: row.version,
      fileSize: row.fileSize,
      mimeType: row.mimeType,
      publishedAt: row.publishedAt,
      downloadHref: resourceDownloadHref(row.id),
    })),
  };
}

export async function getPublicResourceById(id: string) {
  return prisma.resource.findFirst({
    where: {
      id,
      ...publicWhere(),
    },
  });
}

export async function listResources(filters?: {
  q?: string;
  visibility?: ResourceVisibility;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
  const q = filters?.q?.trim();

  const where: Prisma.ResourceWhereInput = {
    deletedAt: null,
    ...(filters?.visibility ? { visibility: filters.visibility } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { slug: { contains: q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.resource.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function getResourceById(id: string) {
  return prisma.resource.findFirst({
    where: { id, deletedAt: null },
  });
}

export function serializeResourceForForm(
  resource: NonNullable<Awaited<ReturnType<typeof getResourceById>>>,
) {
  return {
    id: resource.id,
    title: resource.title,
    slug: resource.slug,
    category: resource.category ?? "",
    version: resource.version ?? "",
    visibility: resource.visibility,
    sortOrder: String(resource.sortOrder),
    publishedAt: toDateInputValue(resource.publishedAt),
    fileKey: resource.fileKey,
    fileSize: resource.fileSize,
    mimeType: resource.mimeType ?? "",
  };
}

export async function createResource(raw: ResourceCreateInput) {
  const input = resourceCreateSchema.parse(raw);
  const slug = await resolveEntitySlug({
    provided: input.slug,
    fromTitle: input.title,
    emptyFallback: "kaynak",
    isTaken: (candidate) => isResourceSlugTaken(candidate),
  });

  return prisma.resource.create({
    data: {
      title: input.title,
      slug,
      category: input.category?.trim() || null,
      version: input.version?.trim() || null,
      visibility: input.visibility,
      sortOrder: input.sortOrder,
      publishedAt: parseOptionalDate(input.publishedAt) ?? new Date(),
      fileKey: input.fileKey,
      fileSize: input.fileSize ?? null,
      mimeType: input.mimeType?.trim() || null,
    },
  });
}

export async function updateResource(id: string, raw: ResourceUpdateInput) {
  const existing = await getResourceById(id);
  if (!existing) throw new Error("NOT_FOUND");

  const input = resourceUpdateSchema.parse(raw);
  const slug = await resolveEntitySlug({
    provided: input.slug,
    fromTitle: input.title,
    emptyFallback: "kaynak",
    isTaken: (candidate) => isResourceSlugTaken(candidate, id),
  });

  const nextFileKey = input.fileKey?.trim() || existing.fileKey;

  return prisma.resource.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      category: input.category?.trim() || null,
      version: input.version?.trim() || null,
      visibility: input.visibility,
      sortOrder: input.sortOrder,
      publishedAt: parseOptionalDate(input.publishedAt),
      fileKey: nextFileKey,
      fileSize:
        nextFileKey === existing.fileKey
          ? existing.fileSize
          : (input.fileSize ?? existing.fileSize),
      mimeType:
        nextFileKey === existing.fileKey
          ? existing.mimeType
          : (input.mimeType?.trim() || existing.mimeType),
    },
  });
}

export async function softDeleteResource(id: string) {
  const existing = await getResourceById(id);
  if (!existing) throw new Error("NOT_FOUND");

  await prisma.resource.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export function formatResourceFileSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatResourceFileType(mimeType: string | null | undefined) {
  if (!mimeType) return null;
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "image/jpeg": "JPG",
    "image/png": "PNG",
  };
  return map[mimeType] ?? mimeType.split("/").pop()?.toUpperCase() ?? null;
}
