import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugifyAssetFilename } from "@/lib/slug";

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export type SavedDocumentFile = {
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
};

function resourcesRoot() {
  return path.join(process.cwd(), "storage", "resources");
}

export function isAllowedDocumentMime(mimeType: string) {
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(
    mimeType as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number],
  );
}

export async function storeDocumentFile(input: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}): Promise<SavedDocumentFile> {
  if (!isAllowedDocumentMime(input.mimeType)) {
    throw new Error("INVALID_MIME");
  }
  if (input.buffer.byteLength <= 0 || input.buffer.byteLength > MAX_DOCUMENT_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const safeName = slugifyAssetFilename(input.originalName);
  const unique = randomBytes(4).toString("hex");
  const filename = `${safeName.replace(/(\.[a-z0-9]+)$/i, "")}-${unique}${path.extname(safeName) || ".pdf"}`;
  const relativeDir = path.posix.join(year, month);
  const absoluteDir = path.join(resourcesRoot(), year, month);
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

export async function readDocumentFile(storageKey: string) {
  const normalized = storageKey.replace(/^\/+/, "").replace(/\.\./g, "");
  const absolutePath = path.join(resourcesRoot(), ...normalized.split("/"));
  const root = resourcesRoot();
  if (!absolutePath.startsWith(root)) {
    throw new Error("INVALID_PATH");
  }
  return readFile(absolutePath);
}
