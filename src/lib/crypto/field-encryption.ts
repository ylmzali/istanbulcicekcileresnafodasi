import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

function getSecret() {
  const secret = process.env.FIELD_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("FIELD_ENCRYPTION_KEY veya AUTH_SECRET tanımlı olmalı.");
  }
  return secret;
}

function getKey() {
  return createHash("sha256").update(getSecret()).digest();
}

/**
 * Deterministic HMAC for looking up an encrypted identity number at login.
 * Not reversible; safe to index/unique.
 */
export function hashIdentityForLookup(plain: string) {
  const normalized = plain.trim();
  if (!normalized) return null;
  return createHmac("sha256", getSecret())
    .update(`identity:${normalized}`)
    .digest("hex");
}

/** Encrypt sensitive plain text for DB storage (`identity_no_encrypted`, etc.). */
export function encryptField(plain: string) {
  const normalized = plain.trim();
  if (!normalized) return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(normalized, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptField(payload: string | null | undefined) {
  if (!payload?.trim()) return null;

  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivB64, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64url")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

export {
  isValidIdentityNo,
  isValidTaxNo,
  normalizeIdentityNo,
  normalizeTaxNo,
} from "@/lib/tr-identity";
