"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { SupportRequestStatus } from "@/generated/prisma/client";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { SUPPORT_STATUS_LABELS } from "@/lib/support-labels";
import { routes } from "@/lib/routes";
import {
  addStaffSupportMessage,
  transitionSupportStatus,
} from "@/services/support";

export type SupportAdminActionState = {
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

const STATUSES = Object.keys(SUPPORT_STATUS_LABELS) as SupportRequestStatus[];

function parseStatus(value: string): SupportRequestStatus | null {
  return STATUSES.includes(value as SupportRequestStatus)
    ? (value as SupportRequestStatus)
    : null;
}

export async function updateSupportStatusAction(
  _prev: SupportAdminActionState,
  formData: FormData,
): Promise<SupportAdminActionState> {
  try {
    const session = await requireAdminPermission("support.manage");
    const id = str(formData, "id").trim();
    const toStatus = parseStatus(str(formData, "toStatus").trim());

    if (!id || !toStatus) {
      return { error: "Geçersiz durum güncellemesi." };
    }

    await transitionSupportStatus({
      id,
      toStatus,
      actorId: session.id,
    });

    revalidatePath(routes.admin.support);
    revalidatePath(routes.admin.supportDetail(id));
    revalidatePath(routes.admin.root);
    revalidatePath(routes.supportTrack);

    return { success: true, message: "Durum güncellendi." };
  } catch (error) {
    rethrowRedirect(error);
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return { error: "Talep bulunamadı." };
      }
      if (error.message === "INVALID_TRANSITION") {
        return { error: "Bu durum geçişine izin verilmiyor." };
      }
    }
    return { error: "Durum güncellenemedi." };
  }
}

export async function addSupportStaffMessageAction(
  _prev: SupportAdminActionState,
  formData: FormData,
): Promise<SupportAdminActionState> {
  try {
    const session = await requireAdminPermission("support.manage");
    const id = str(formData, "id").trim();
    const message = str(formData, "message");
    const visibility =
      str(formData, "visibility") === "internal" ? "internal" : "public";
    const setWaiting = formData.get("setWaiting") === "true";

    if (!id) {
      return { error: "Geçersiz talep." };
    }

    await addStaffSupportMessage({
      id,
      message,
      visibility,
      actorId: session.id,
      alsoSetStatus:
        visibility === "public" && setWaiting
          ? "waiting_for_applicant"
          : null,
    });

    revalidatePath(routes.admin.support);
    revalidatePath(routes.admin.supportDetail(id));
    revalidatePath(routes.admin.root);
    revalidatePath(routes.supportTrack);

    return {
      success: true,
      message:
        visibility === "internal" ? "İç not kaydedildi." : "Yanıt gönderildi.",
    };
  } catch (error) {
    rethrowRedirect(error);
    if (error instanceof Error) {
      switch (error.message) {
        case "NOT_FOUND":
          return { error: "Talep bulunamadı." };
        case "MESSAGE_REQUIRED":
          return { error: "Mesaj gerekli." };
        case "MESSAGE_TOO_LONG":
          return { error: "Mesaj çok uzun." };
        case "INVALID_TRANSITION":
          return { error: "Seçilen durum geçişine izin verilmiyor." };
        default:
          break;
      }
    }
    return { error: "Mesaj kaydedilemedi." };
  }
}
