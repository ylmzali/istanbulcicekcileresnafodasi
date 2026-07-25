"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { ApplicationStatus } from "@/generated/prisma/client";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";
import { transitionApplicationStatus } from "@/services/applications";

export type ApplicationActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return value == null ? "" : String(value);
}

function rethrowRedirect(error: unknown) {
  if (isRedirectError(error)) throw error;
}

const STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "missing_documents",
  "approved",
  "rejected",
  "cancelled",
];

function parseStatus(value: string): ApplicationStatus | null {
  return STATUSES.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : null;
}

export async function updateApplicationStatusAction(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  try {
    const session = await requireAdminPermission("applications.manage");
    const id = str(formData, "id").trim();
    const toStatus = parseStatus(str(formData, "toStatus").trim());
    const note = str(formData, "note").trim() || null;

    if (!id || !toStatus) {
      return { error: "Geçersiz durum güncellemesi." };
    }

    await transitionApplicationStatus({
      id,
      toStatus,
      note,
      actorId: session.id,
    });

    revalidatePath(routes.admin.applications);
    revalidatePath(routes.admin.applicationDetail(id));
    revalidatePath(routes.admin.root);
    revalidatePath(routes.membership.applyTrack);

    return { success: true, message: "Durum güncellendi." };
  } catch (error) {
    rethrowRedirect(error);
    if (error instanceof Error) {
      switch (error.message) {
        case "NOT_FOUND":
          return { error: "Başvuru bulunamadı." };
        case "NOTE_REQUIRED":
          return { error: "Bu durum için not zorunludur." };
        case "INVALID_TRANSITION":
          return { error: "Bu durum geçişine izin verilmiyor." };
        case "TERMINAL_STATUS":
          return { error: "Sonuçlanmış başvuru güncellenemez." };
        default:
          break;
      }
    }
    return { error: "Durum güncellenemedi." };
  }
}
