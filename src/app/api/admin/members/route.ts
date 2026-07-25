import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/session";
import {
  listMembersForAdminTable,
  memberStatusSchema,
} from "@/services/members";

const querySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: memberStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz işlem.", data: null },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const statusRaw = searchParams.get("status")?.trim() || undefined;
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    status: statusRaw || undefined,
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "10",
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Geçersiz istek.",
        data: null,
        errors: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const data = await listMembersForAdminTable({
      q: parsed.data.q || undefined,
      status: parsed.data.status,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

    return NextResponse.json({
      success: true,
      message: "ok",
      data,
      meta: {
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Üye listesi yüklenemedi.",
        data: null,
      },
      { status: 500 },
    );
  }
}
