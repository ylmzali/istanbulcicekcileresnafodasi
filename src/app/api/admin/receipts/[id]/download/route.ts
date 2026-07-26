import { NextResponse } from "next/server";
import { sessionHasPermission } from "@/lib/auth/permissions";
import { getAdminSession } from "@/lib/auth/session";
import { readReceiptFile } from "@/lib/media/receipt-storage";
import { getReceiptFileForAdmin } from "@/services/dues";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function safeFilename(value: string) {
  return value.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180) || "makbuz.pdf";
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (
    !session ||
    (!sessionHasPermission(session, "dues.view") &&
      !sessionHasPermission(session, "dues.collect"))
  ) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz işlem." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const receipt = await getReceiptFileForAdmin(id);
  if (!receipt?.fileKey) {
    return NextResponse.json(
      { success: false, message: "Makbuz dosyası bulunamadı." },
      { status: 404 },
    );
  }

  try {
    const buffer = await readReceiptFile(receipt.fileKey);
    const filename = safeFilename(
      receipt.originalFilename || `${receipt.receiptNo}.pdf`,
    );
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": receipt.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Dosya okunamadı." },
      { status: 500 },
    );
  }
}
