import { z } from "zod";
import type { Banner, BannerVariant } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export const bannerVariantSchema = z.enum([
  "text_cta",
  "media_cta",
  "image_link",
]);

const optionalHrefSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null || value === "") return null;
    return value;
  })
  .refine(
    (value) =>
      value == null ||
      value.startsWith("/") ||
      value.startsWith("https://") ||
      value.startsWith("http://"),
    { message: "INVALID_HREF" },
  );

export const bannerInputSchema = z
  .object({
    variant: bannerVariantSchema.default("text_cta"),
    eyebrow: z.string().trim().max(160).optional().nullable(),
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().max(2000).optional().nullable(),
    imageKey: z.string().trim().max(500).optional().nullable(),
    mobileImageKey: z.string().trim().max(500).optional().nullable(),
    primaryCtaLabel: z.string().trim().max(120).optional().nullable(),
    primaryCtaHref: optionalHrefSchema,
    primaryCtaNewTab: z.boolean().default(false),
    secondaryCtaLabel: z.string().trim().max(120).optional().nullable(),
    secondaryCtaHref: optionalHrefSchema,
    secondaryCtaNewTab: z.boolean().default(false),
    sortOrder: z.coerce.number().int().default(0),
    active: z.boolean().default(true),
    startsAt: z.string().trim().optional().nullable(),
    endsAt: z.string().trim().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.variant === "image_link" || data.variant === "media_cta") &&
      !data.imageKey
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["imageKey"],
        message: "IMAGE_REQUIRED",
      });
    }
  });

export type BannerInput = z.infer<typeof bannerInputSchema>;

export type HeroSlide = {
  id: string;
  variant: BannerVariant;
  eyebrow: string | null;
  title: string;
  description: string | null;
  imageKey: string | null;
  mobileImageKey: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  primaryCtaNewTab: boolean;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  secondaryCtaNewTab: boolean;
};

function parseOptionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNullableString(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function mapBanner(banner: Banner): HeroSlide {
  return {
    id: banner.id,
    variant: banner.variant,
    eyebrow: banner.eyebrow,
    title: banner.title,
    description: banner.description,
    imageKey: banner.imageKey,
    mobileImageKey: banner.mobileImageKey,
    primaryCtaLabel: banner.primaryCtaLabel,
    primaryCtaHref: banner.primaryCtaHref,
    primaryCtaNewTab: banner.primaryCtaNewTab,
    secondaryCtaLabel: banner.secondaryCtaLabel,
    secondaryCtaHref: banner.secondaryCtaHref,
    secondaryCtaNewTab: banner.secondaryCtaNewTab,
  };
}

function fallbackHeroSlides(): HeroSlide[] {
  const messages = getMessages().hero.slides;
  const links = [
    { primary: routes.membership.root, secondary: routes.corporate.root },
    { primary: routes.news.root, secondary: routes.membership.apply },
    { primary: routes.member.login, secondary: routes.contact },
  ] as const;

  return messages.map((slide, index) => {
    const link = links[index] ?? links[0];
    return {
      id: `fallback-${index}`,
      variant: "text_cta" as const,
      eyebrow: slide.eyebrow,
      title: slide.title,
      description: slide.description,
      imageKey: null,
      mobileImageKey: null,
      primaryCtaLabel: slide.primaryCta,
      primaryCtaHref: link.primary,
      primaryCtaNewTab: false,
      secondaryCtaLabel: slide.secondaryCta,
      secondaryCtaHref: link.secondary,
      secondaryCtaNewTab: false,
    };
  });
}

export async function listBanners(filters?: {
  active?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
  const where = {
    ...(typeof filters?.active === "boolean"
      ? { active: filters.active }
      : {}),
    ...(filters?.q
      ? {
          OR: [
            { title: { contains: filters.q } },
            { eyebrow: { contains: filters.q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.banner.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.banner.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function getBannerById(id: string) {
  return prisma.banner.findUnique({ where: { id } });
}

export async function listActiveHeroSlides(): Promise<HeroSlide[]> {
  const now = new Date();
  const rows = await prisma.banner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  if (rows.length === 0) {
    return fallbackHeroSlides();
  }

  return rows.map(mapBanner);
}

export async function createBanner(raw: BannerInput) {
  const input = bannerInputSchema.parse(raw);

  return prisma.banner.create({
    data: {
      variant: input.variant,
      eyebrow: toNullableString(input.eyebrow),
      title: input.title,
      description: toNullableString(input.description),
      imageKey: toNullableString(input.imageKey),
      mobileImageKey: toNullableString(input.mobileImageKey),
      primaryCtaLabel: toNullableString(input.primaryCtaLabel),
      primaryCtaHref: input.primaryCtaHref,
      primaryCtaNewTab: input.primaryCtaNewTab,
      secondaryCtaLabel: toNullableString(input.secondaryCtaLabel),
      secondaryCtaHref: input.secondaryCtaHref,
      secondaryCtaNewTab: input.secondaryCtaNewTab,
      sortOrder: input.sortOrder,
      active: input.active,
      startsAt: parseOptionalDate(input.startsAt),
      endsAt: parseOptionalDate(input.endsAt),
    },
  });
}

export async function updateBanner(id: string, raw: BannerInput) {
  const existing = await getBannerById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const input = bannerInputSchema.parse(raw);

  return prisma.banner.update({
    where: { id },
    data: {
      variant: input.variant,
      eyebrow: toNullableString(input.eyebrow),
      title: input.title,
      description: toNullableString(input.description),
      imageKey: toNullableString(input.imageKey),
      mobileImageKey: toNullableString(input.mobileImageKey),
      primaryCtaLabel: toNullableString(input.primaryCtaLabel),
      primaryCtaHref: input.primaryCtaHref,
      primaryCtaNewTab: input.primaryCtaNewTab,
      secondaryCtaLabel: toNullableString(input.secondaryCtaLabel),
      secondaryCtaHref: input.secondaryCtaHref,
      secondaryCtaNewTab: input.secondaryCtaNewTab,
      sortOrder: input.sortOrder,
      active: input.active,
      startsAt: parseOptionalDate(input.startsAt),
      endsAt: parseOptionalDate(input.endsAt),
    },
  });
}

export async function deleteBanner(id: string) {
  const existing = await getBannerById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  return prisma.banner.delete({ where: { id } });
}

export async function listBannerSortIds() {
  const rows = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function setBannerActive(id: string, active: boolean) {
  const existing = await getBannerById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  return prisma.banner.update({
    where: { id },
    data: { active },
  });
}

export async function moveBannerSort(
  id: string,
  direction: "up" | "down",
) {
  const rows = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
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
      prisma.banner.update({
        where: { id: row.id },
        data: { sortOrder },
      }),
    ),
  );

  return { moved: true as const };
}
