import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { slugifyAssetFilename } from "@/lib/slug";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  MEDIA_PRESETS,
  type MediaPresetId,
} from "@/lib/media/presets";

export type SavedMediaFile = {
  storageKey: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
};

function assertAllowedMime(mimeType: string) {
  if (
    !ALLOWED_UPLOAD_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
    )
  ) {
    throw new Error("INVALID_MIME");
  }
}

export async function processAndStoreImage(input: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  presetId: MediaPresetId;
}): Promise<SavedMediaFile> {
  assertAllowedMime(input.mimeType);

  if (input.buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const preset = MEDIA_PRESETS[input.presetId];
  if (!preset) {
    throw new Error("INVALID_PRESET");
  }

  const processed = await sharp(input.buffer)
    .rotate()
    .resize({
      width: preset.maxWidth,
      height: preset.maxHeight,
      fit: "cover",
      position: "centre",
      withoutEnlargement: true,
    })
    .webp({ quality: preset.quality })
    .toBuffer({ resolveWithObject: true });

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const baseName = slugifyAssetFilename(input.originalName).replace(
    /\.[a-z0-9]+$/i,
    "",
  );
  const unique = randomBytes(4).toString("hex");
  const filename = `${baseName || "gorsel"}-${unique}.webp`;
  const relativeDir = path.posix.join("uploads", preset.folder, year, month);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, filename);
  await writeFile(absolutePath, processed.data);

  const storageKey = path.posix.join(relativeDir, filename);
  return {
    storageKey,
    publicUrl: `/${storageKey}`,
    filename,
    mimeType: "image/webp",
    size: processed.data.byteLength,
    width: processed.info.width,
    height: processed.info.height,
  };
}
