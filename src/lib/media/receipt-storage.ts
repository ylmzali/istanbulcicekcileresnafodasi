import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugifyAssetFilename } from "@/lib/slug";

export const ALLOWED_RECEIPT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_RECEIPT_FILE_BYTES = 10 * 1024 * 1024;

export type SavedReceiptFile = {
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
};

function receiptsRoot() {
  return path.join(process.cwd(), "storage", "receipts");
}

export function isAllowedReceiptMime(mimeType: string) {
  return ALLOWED_RECEIPT_MIME_TYPES.includes(
    mimeType as (typeof ALLOWED_RECEIPT_MIME_TYPES)[number],
  );
}

export async function storeReceiptFile(input: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}): Promise<SavedReceiptFile> {
  if (!isAllowedReceiptMime(input.mimeType)) {
    throw new Error("INVALID_MIME");
  }
  if (
    input.buffer.byteLength <= 0 ||
    input.buffer.byteLength > MAX_RECEIPT_FILE_BYTES
  ) {
    throw new Error("FILE_TOO_LARGE");
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const safeName = slugifyAssetFilename(input.originalName);
  const unique = randomBytes(4).toString("hex");
  const ext =
    path.extname(safeName) ||
    (input.mimeType === "application/pdf" ? ".pdf" : ".jpg");
  const filename = `${safeName.replace(/(\.[a-z0-9]+)$/i, "")}-${unique}${ext}`;
  const relativeDir = path.posix.join(year, month);
  const absoluteDir = path.join(receiptsRoot(), year, month);
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

export async function readReceiptFile(storageKey: string) {
  const normalized = storageKey.replace(/^\/+/, "").replace(/\.\./g, "");
  const absolutePath = path.join(receiptsRoot(), ...normalized.split("/"));
  const root = receiptsRoot();
  if (!absolutePath.startsWith(root)) {
    throw new Error("INVALID_PATH");
  }
  return readFile(absolutePath);
}

export async function deleteReceiptFile(storageKey: string) {
  const normalized = storageKey.replace(/^\/+/, "").replace(/\.\./g, "");
  const absolutePath = path.join(receiptsRoot(), ...normalized.split("/"));
  const root = receiptsRoot();
  if (!absolutePath.startsWith(root)) {
    throw new Error("INVALID_PATH");
  }
  try {
    await unlink(absolutePath);
  } catch {
    // Missing file is fine when replacing or cleaning up.
  }
}
