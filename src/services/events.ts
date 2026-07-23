import { z } from "zod";
import type { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { slugify, slugSchema } from "@/lib/slug";
import { contentStatusSchema } from "@/services/posts";

export const eventInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  eventType: z.string().trim().max(80).optional().nullable(),
  location: z.string().trim().max(255).optional().nullable(),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().trim().max(500).optional().nullable(),
  startsAt: z.string().min(1),
  endsAt: z.string().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  registrationOpen: z.string().optional().nullable(),
  registrationClose: z.string().optional().nullable(),
  status: contentStatusSchema.default("draft"),
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

async function uniqueEventSlug(base: string, excludeId?: string) {
  const validated = slugSchema.parse(base || "etkinlik");
  let candidate = validated;
  let index = 2;

  while (true) {
    const existing = await prisma.event.findFirst({
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
      orderBy: [{ startsAt: "desc" }],
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

export async function createEvent(raw: EventInput) {
  const input = eventInputSchema.parse(raw);
  const slug = await uniqueEventSlug(
    input.slug?.trim() ? slugify(input.slug) : slugify(input.title),
  );

  return prisma.event.create({
    data: {
      title: input.title,
      slug,
      description: input.description || null,
      eventType: input.eventType || null,
      location: input.location || null,
      isOnline: input.isOnline,
      onlineUrl: input.onlineUrl || null,
      startsAt: parseRequiredDate(input.startsAt),
      endsAt: parseOptionalDate(input.endsAt),
      capacity: input.capacity ?? null,
      registrationOpen: parseOptionalDate(input.registrationOpen),
      registrationClose: parseOptionalDate(input.registrationClose),
      status: input.status,
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
  const slug = await uniqueEventSlug(
    input.slug?.trim() ? slugify(input.slug) : slugify(input.title),
    id,
  );

  return prisma.event.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      description: input.description || null,
      eventType: input.eventType || null,
      location: input.location || null,
      isOnline: input.isOnline,
      onlineUrl: input.onlineUrl || null,
      startsAt: parseRequiredDate(input.startsAt),
      endsAt: parseOptionalDate(input.endsAt),
      capacity: input.capacity ?? null,
      registrationOpen: parseOptionalDate(input.registrationOpen),
      registrationClose: parseOptionalDate(input.registrationClose),
      status: input.status,
      coverImage: input.coverImage || null,
    },
  });
}

export async function softDeleteEvent(id: string) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  return prisma.event.update({
    where: { id },
    data: { deletedAt: new Date(), status: "archived" },
  });
}
