import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_BYTES,
  isAllowedDocumentMime,
  storeDocumentFile,
} from "@/lib/media/document-storage";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Yetkisiz işlem." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Dosya bulunamadı." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      { success: false, message: "Dosya boyutu 20 MB’ı aşamaz." },
      { status: 400 },
    );
  }

  if (!isAllowedDocumentMime(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: `İzin verilen türler: ${ALLOWED_DOCUMENT_MIME_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await storeDocumentFile({
      buffer,
      originalName: file.name || "belge.pdf",
      mimeType: file.type,
    });

    return NextResponse.json({
      success: true,
      message: "Dosya yüklendi.",
      data: saved,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Dosya yüklenemedi." },
      { status: 500 },
    );
  }
}
