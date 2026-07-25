import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

export type AuditWriteInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Best-effort audit write — never throws to callers. */
export async function writeAuditLog(input: AuditWriteInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action.slice(0, 120),
        entityType: input.entityType.slice(0, 120),
        entityId: input.entityId?.slice(0, 80) ?? null,
        beforeJson: input.before === undefined ? undefined : (input.before as object),
        afterJson: input.after === undefined ? undefined : (input.after as object),
        ipHash: input.ip ? hashValue(input.ip) : null,
        userAgent: input.userAgent?.slice(0, 512) ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] write failed", error);
  }
}

export function hashIdentifierForAudit(identifier: string) {
  return hashValue(identifier.trim().toLowerCase());
}
