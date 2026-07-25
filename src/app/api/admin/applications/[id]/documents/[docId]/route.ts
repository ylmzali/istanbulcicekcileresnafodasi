import { NextResponse } from "next/server";
import {
  sessionHasPermission,
} from "@/lib/auth/permissions";
import { getAdminSession } from "@/lib/auth/session";
import { readApplicationFile } from "@/lib/media/application-storage";
import { getApplicationDocumentForAdmin } from "@/services/applications";

type RouteContext = {
  params: Promise<{ id: string; docId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session || !sessionHasPermission(session, "applications.manage")) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz işlem." },
      { status: 401 },
    );
  }

  const { id, docId } = await context.params;
  const doc = await getApplicationDocumentForAdmin({
    applicationId: id,
    documentId: docId,
  });
  if (!doc) {
    return NextResponse.json(
      { success: false, message: "Belge bulunamadı." },
      { status: 404 },
    );
  }

  try {
    const buffer = await readApplicationFile(doc.storageKey);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${doc.originalName.replace(/"/g, "")}"`,
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
