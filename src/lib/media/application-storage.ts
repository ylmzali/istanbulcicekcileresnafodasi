import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugifyAssetFilename } from "@/lib/slug";

export const ALLOWED_APPLICATION_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_APPLICATION_FILE_BYTES = 10 * 1024 * 1024;

export type SavedApplicationFile = {
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
};

function applicationsRoot() {
  return path.join(process.cwd(), "storage", "applications");
}

export function isAllowedApplicationMime(mimeType: string) {
  return ALLOWED_APPLICATION_MIME_TYPES.includes(
    mimeType as (typeof ALLOWED_APPLICATION_MIME_TYPES)[number],
  );
}

export async function storeApplicationFile(input: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}): Promise<SavedApplicationFile> {
  if (!isAllowedApplicationMime(input.mimeType)) {
    throw new Error("INVALID_MIME");
  }
  if (
    input.buffer.byteLength <= 0 ||
    input.buffer.byteLength > MAX_APPLICATION_FILE_BYTES
  ) {
    throw new Error("FILE_TOO_LARGE");
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const safeName = slugifyAssetFilename(input.originalName);
  const unique = randomBytes(4).toString("hex");
  const ext = path.extname(safeName) || (input.mimeType === "application/pdf" ? ".pdf" : ".jpg");
  const filename = `${safeName.replace(/(\.[a-z0-9]+)$/i, "")}-${unique}${ext}`;
  const relativeDir = path.posix.join(year, month);
  const absoluteDir = path.join(applicationsRoot(), year, month);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, filename);
  await writeFile(absolutePath, input.buffer);

  return {
    storageKey: path.posix.join(relativeDir, filename),
    filename,
    mimeType: input.mimeType,
    size: input.buffer.byteLength,
  };
}

export async function readApplicationFile(storageKey: string) {
  const normalized = storageKey.replace(/^\/+/, "").replace(/\.\./g, "");
  const absolutePath = path.join(applicationsRoot(), ...normalized.split("/"));
  const root = applicationsRoot();
  if (!absolutePath.startsWith(root)) {
    throw new Error("INVALID_PATH");
  }
  return readFile(absolutePath);
}
