import { z } from "zod";
import type { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { sanitizeArticleHtml } from "@/lib/html-sanitize";
import { resolveEntitySlug } from "@/lib/resolve-slug";
import { contentStatusSchema } from "@/services/posts";

export const eventInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().optional(),
  description: z
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
  location: z.string().trim().max(255).optional().nullable(),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().trim().max(500).optional().nullable(),
  startsAt: z.string().min(1),
  endsAt: z.string().optional().nullable(),
  capacity: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((value) => {
      if (value == null || value === "") return null;
      if (typeof value === "number") {
        return Number.isInteger(value) && value > 0 ? value : null;
      }
      const digits = value.replace(/\D/g, "");
      if (!digits) return null;
      const parsed = Number(digits);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }),
  registrationOpen: z.string().optional().nullable(),
  registrationClose: z.string().optional().nullable(),
  status: contentStatusSchema.default("draft"),
  featured: z.boolean().default(false),
  coverImage: z.string().trim().max(500).optional().nullable(),
});

export type EventInput = z.infer<typeof eventInputSchema>;

function parseRequiredDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return date;
}

function parseOptionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function isEventSlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.event.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function resolveEventSlug(
  provided: string | null | undefined,
  title: string,
  excludeId?: string,
) {
  return resolveEntitySlug({
    provided,
    fromTitle: title,
    emptyFallback: "etkinlik",
    isTaken: (slug) => isEventSlugTaken(slug, excludeId),
  });
}

export async function listEvents(filters?: {
  status?: ContentStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
  const where = {
    deletedAt: null as Date | null,
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
    prisma.event.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { sortOrder: "asc" },
        { startsAt: "desc" },
      ],
      include: {
        _count: { select: { registrations: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function getEventById(id: string) {
  return prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: {
      _count: { select: { registrations: true } },
    },
  });
}

async function nextFeaturedEventSortOrder(excludeId?: string) {
  const max = await prisma.event.aggregate({
    where: {
      deletedAt: null,
      featured: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    _max: { sortOrder: true },
  });
  return (max._max.sortOrder ?? -1) + 1;
}

async function reindexFeaturedEvents() {
  const rows = await prisma.event.findMany({
    where: { deletedAt: null, featured: true },
    orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  await prisma.$transaction(
    rows.map((row, sortOrder) =>
      prisma.event.update({
        where: { id: row.id },
        data: { sortOrder },
      }),
    ),
  );
}

export async function createEvent(raw: EventInput) {
  const input = eventInputSchema.parse(raw);
  const slug = await resolveEventSlug(input.slug, input.title);
  const sortOrder = input.featured ? await nextFeaturedEventSortOrder() : 0;

  return prisma.event.create({
    data: {
      title: input.title,
      slug,
      description: input.description || null,
      eventType: null,
      location: input.location || null,
      isOnline: input.isOnline,
      onlineUrl: input.onlineUrl || null,
      startsAt: parseRequiredDate(input.startsAt),
      endsAt: parseOptionalDate(input.endsAt),
      capacity: input.capacity ?? null,
      registrationOpen: parseOptionalDate(input.registrationOpen),
      registrationClose: parseOptionalDate(input.registrationClose),
      status: input.status,
      featured: input.featured,
      sortOrder,
      coverImage: input.coverImage || null,
    },
  });
}

export async function updateEvent(id: string, raw: EventInput) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const input = eventInputSchema.parse(raw);
  const slug = await resolveEventSlug(input.slug, input.title, id);

  let sortOrder = existing.sortOrder;
  if (input.featured && !existing.featured) {
    sortOrder = await nextFeaturedEventSortOrder(id);
  } else if (!input.featured && existing.featured) {
    sortOrder = 0;
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      description: input.description || null,
      eventType: null,
      location: input.location || null,
      isOnline: input.isOnline,
      onlineUrl: input.onlineUrl || null,
      startsAt: parseRequiredDate(input.startsAt),
      endsAt: parseOptionalDate(input.endsAt),
      capacity: input.capacity ?? null,
      registrationOpen: parseOptionalDate(input.registrationOpen),
      registrationClose: parseOptionalDate(input.registrationClose),
      status: input.status,
      featured: input.featured,
      sortOrder,
      coverImage: input.coverImage || null,
    },
  });

  if (!input.featured && existing.featured) {
    await reindexFeaturedEvents();
  }

  return updated;
}

export async function softDeleteEvent(id: string) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { deletedAt: new Date(), status: "archived", featured: false, sortOrder: 0 },
  });

  if (existing.featured) {
    await reindexFeaturedEvents();
  }

  return updated;
}

export async function setEventFeatured(id: string, featured: boolean) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (existing.featured === featured) {
    return existing;
  }

  if (featured) {
    return prisma.event.update({
      where: { id },
      data: {
        featured: true,
        sortOrder: await nextFeaturedEventSortOrder(id),
      },
    });
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { featured: false, sortOrder: 0 },
  });
  await reindexFeaturedEvents();
  return updated;
}

export async function moveEventSort(id: string, direction: "up" | "down") {
  const rows = await prisma.event.findMany({
    where: { deletedAt: null, featured: true },
    orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }, { id: "asc" }],
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
      prisma.event.update({
        where: { id: row.id },
        data: { sortOrder },
      }),
    ),
  );

  return { moved: true as const };
}

export async function listFeaturedEventIds() {
  const rows = await prisma.event.findMany({
    where: { deletedAt: null, featured: true },
    orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

const publicEventSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  location: true,
  isOnline: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  coverImage: true,
  featured: true,
  sortOrder: true,
} as const;

export async function listUpcomingEvents(limit = 3) {
  const now = new Date();
  return prisma.event.findMany({
    where: {
      deletedAt: null,
      status: "published",
      startsAt: { gte: now },
    },
    orderBy: [{ startsAt: "asc" }, { sortOrder: "asc" }],
    take: limit,
    select: publicEventSelect,
  });
}

/** Public list hero: the admin-marked featured event (prefer upcoming). */
export async function getFeaturedPublicEvent() {
  const now = new Date();
  const baseWhere = {
    deletedAt: null as Date | null,
    status: "published" as const,
    featured: true,
  };

  const upcoming = await prisma.event.findFirst({
    where: { ...baseWhere, startsAt: { gte: now } },
    orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
    select: publicEventSelect,
  });
  if (upcoming) return upcoming;

  return prisma.event.findFirst({
    where: baseWhere,
    orderBy: [{ sortOrder: "asc" }, { startsAt: "desc" }],
    select: publicEventSelect,
  });
}

export async function listPublishedEvents(filters?: {
  page?: number;
  pageSize?: number;
  upcomingOnly?: boolean;
  scope?: "all" | "upcoming" | "past";
  /** Exclude the featured hero card from the grid (page 1). */
  excludeId?: string | null;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 12));
  const now = new Date();
  const scope =
    filters?.scope ?? (filters?.upcomingOnly ? "upcoming" : "all");

  const where = {
    deletedAt: null as Date | null,
    status: "published" as const,
    ...(filters?.excludeId ? { id: { not: filters.excludeId } } : {}),
    ...(scope === "upcoming"
      ? { startsAt: { gte: now } }
      : scope === "past"
        ? { startsAt: { lt: now } }
        : {}),
  };

  // List by date only — featured belongs in the hero slot, not list priority.
  const orderBy =
    scope === "past"
      ? ([{ startsAt: "desc" }, { sortOrder: "asc" }] as const)
      : ([{ startsAt: "asc" }, { sortOrder: "asc" }] as const);

  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [...orderBy],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: publicEventSelect,
    }),
    prisma.event.count({ where }),
  ]);

  return { rows, total, page, pageSize, scope };
}

export async function getPublishedEventBySlug(slug: string) {
  if (!slug) return null;
  return prisma.event.findFirst({
    where: {
      slug,
      deletedAt: null,
      status: "published",
    },
  });
}

export async function listPublishedEventSlugs() {
  return prisma.event.findMany({
    where: { deletedAt: null, status: "published" },
    select: { slug: true, updatedAt: true, startsAt: true },
    orderBy: [{ startsAt: "desc" }],
  });
}
