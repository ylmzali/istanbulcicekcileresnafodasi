import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { searchPublicContent } from "@/services/search";

const querySchema = z.object({
  q: z.string().trim().max(80).default(""),
});

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Geçersiz arama.", data: null },
      { status: 400 },
    );
  }

  const rate = consumeRateLimit({
    key: `public-search:${clientIp(request)}`,
    limit: 40,
    windowMs: 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      {
        success: false,
        message: `Çok fazla arama. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
        data: null,
      },
      { status: 429 },
    );
  }

  try {
    const data = await searchPublicContent(parsed.data.q);
    return NextResponse.json({
      success: true,
      message: "ok",
      data,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Arama şu an yapılamıyor.",
        data: null,
      },
      { status: 500 },
    );
  }
}
