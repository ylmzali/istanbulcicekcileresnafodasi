import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import {
  listPublicFloristMapPoints,
  listPublicFlorists,
} from "@/services/directory";

const querySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  district: z.string().trim().max(140).optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(48),
  mode: z.enum(["list", "map"]).default("list"),
});

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(request: Request) {
  const rate = consumeRateLimit({
    key: `public-florists:${clientIp(request)}`,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      {
        success: false,
        message: `Çok fazla istek. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
        data: null,
      },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    district: searchParams.get("district") ?? "",
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "48",
    mode: searchParams.get("mode") ?? "list",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek.", data: null },
      { status: 400 },
    );
  }

  try {
    const filters = {
      q: parsed.data.q || undefined,
      districtSlug: parsed.data.district || undefined,
    };

    if (parsed.data.mode === "map") {
      const points = await listPublicFloristMapPoints(filters);
      return NextResponse.json({
        success: true,
        message: "ok",
        data: { items: points, total: points.length },
      });
    }

    const data = await listPublicFlorists({
      ...filters,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

    return NextResponse.json({
      success: true,
      message: "ok",
      data,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Rehber yüklenemedi.",
        data: null,
      },
      { status: 500 },
    );
  }
}
