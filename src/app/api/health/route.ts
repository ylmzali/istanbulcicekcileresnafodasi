import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "ok",
    data: {
      status: "healthy",
      time: new Date().toISOString(),
    },
  });
}
