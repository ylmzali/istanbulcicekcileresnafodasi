import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/session";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  MEDIA_PRESETS,
} from "@/lib/media/presets";
import { uploadPublicImage } from "@/services/media";

const presetSchema = z.enum([
  "post-cover",
  "event-cover",
  "hero-desktop",
  "hero-mobile",
  "hero-media",
  "hero-image-link",
]);

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

  const presetParsed = presetSchema.safeParse(String(formData.get("preset") ?? ""));
  if (!presetParsed.success || !(presetParsed.data in MEDIA_PRESETS)) {
    return NextResponse.json(
      { success: false, message: "Geçersiz görsel boyutu." },
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

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { success: false, message: "Dosya boyutu 8 MB’ı aşamaz." },
      { status: 400 },
    );
  }

  if (
    !ALLOWED_UPLOAD_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
    )
  ) {
    return NextResponse.json(
      { success: false, message: "Yalnızca JPG, PNG veya WebP yükleyebilirsiniz." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadPublicImage({
      buffer,
      originalName: file.name || "gorsel.webp",
      mimeType: file.type,
      presetId: presetParsed.data,
      uploadedById: session.id,
    });

    return NextResponse.json({
      success: true,
      message: "Görsel yüklendi.",
      data: uploaded,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Görsel işlenemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
