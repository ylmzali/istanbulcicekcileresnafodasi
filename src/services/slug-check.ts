import { prisma } from "@/lib/db";
import { slugify, slugSchema } from "@/lib/slug";
import {
  slugCheckScopeSchema,
  type SlugCheckResult,
  type SlugCheckScope,
} from "@/lib/slug-check";

export type { SlugCheckResult, SlugCheckScope };
export { slugCheckScopeSchema };

async function isTaken(
  scope: SlugCheckScope,
  slug: string,
  excludeId?: string | null,
) {
  if (scope === "post") {
    const row = await prisma.post.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  if (scope === "event") {
    const row = await prisma.event.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  const row = await prisma.faqCategory.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function checkSlugAvailability(input: {
  scope: SlugCheckScope;
  slug: string;
  excludeId?: string | null;
}): Promise<SlugCheckResult> {
  const scope = slugCheckScopeSchema.parse(input.scope);
  const raw = input.slug.trim();

  if (!raw) {
    return { status: "empty", slug: "", available: true };
  }

  const normalized = slugify(raw);
  const parsed = slugSchema.safeParse(normalized);
  if (!parsed.success) {
    return { status: "invalid", slug: normalized, available: false };
  }

  const taken = await isTaken(scope, parsed.data, input.excludeId);
  if (taken) {
    return { status: "taken", slug: parsed.data, available: false };
  }

  return { status: "available", slug: parsed.data, available: true };
}
