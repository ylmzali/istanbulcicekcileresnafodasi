import "server-only";

import { prisma } from "@/lib/db";
import { processAndStoreImage } from "@/lib/media/storage";
import type { MediaPresetId } from "@/lib/media/presets";

export async function uploadPublicImage(input: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  presetId: MediaPresetId;
  uploadedById?: string | null;
  altText?: string | null;
}) {
  const saved = await processAndStoreImage({
    buffer: input.buffer,
    originalName: input.originalName,
    mimeType: input.mimeType,
    presetId: input.presetId,
  });

  const media = await prisma.media.create({
    data: {
      storageKey: saved.storageKey,
      filename: saved.filename,
      mimeType: saved.mimeType,
      size: saved.size,
      width: saved.width,
      height: saved.height,
      altText: input.altText ?? null,
      visibility: "public",
      uploadedById: input.uploadedById ?? null,
    },
  });

  return {
    id: media.id,
    url: saved.publicUrl,
    width: saved.width,
    height: saved.height,
    filename: saved.filename,
  };
}
