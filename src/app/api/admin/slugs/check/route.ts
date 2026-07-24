import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/session";
import { slugCheckScopeSchema } from "@/lib/slug-check";
import { checkSlugAvailability } from "@/services/slug-check";

const querySchema = z.object({
  scope: slugCheckScopeSchema,
  slug: z.string().max(255).default(""),
  excludeId: z.string().trim().min(1).max(64).optional(),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz işlem." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    scope: searchParams.get("scope") ?? undefined,
    slug: searchParams.get("slug") ?? "",
    excludeId: searchParams.get("excludeId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Geçersiz istek.",
        errors: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = await checkSlugAvailability(parsed.data);

  return NextResponse.json({
    success: true,
    message: null,
    data,
  });
}
