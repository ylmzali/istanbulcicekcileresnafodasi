import { NextResponse } from "next/server";
import { parseHomeNewsTab } from "@/lib/home-news";
import { getHomeNewsFeed, serializeHomeNewsItem } from "@/services/posts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = parseHomeNewsTab(searchParams.get("tab"));
  const limitRaw = Number(searchParams.get("limit") ?? 4);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 4;

  try {
    const rows = await getHomeNewsFeed(limit, tab);
    return NextResponse.json({
      success: true,
      message: "ok",
      data: rows.map(serializeHomeNewsItem),
      meta: { tab, limit: Math.max(1, Math.min(12, limit)) },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Haberler yüklenemedi.",
        data: null,
        errors: [{ code: "FETCH_FAILED" }],
      },
      { status: 500 },
    );
  }
}
