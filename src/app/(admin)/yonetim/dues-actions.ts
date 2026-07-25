"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";
import {
  assessDuesPeriod,
  collectMemberDuePayment,
  createDuesPeriod,
  syncOpenMemberDuesForPeriod,
  unwaiveMemberDue,
  updateDuesPeriod,
  waiveMemberDue,
  type CollectPaymentInput,
  type DuesPeriodCreateInput,
} from "@/services/dues";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return value == null ? "" : String(value);
}

function nullable(formData: FormData, key: string) {
  const value = str(formData, key).trim();
  return value.length ? value : null;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function rethrowRedirect(error: unknown) {
  if (isRedirectError(error)) throw error;
}

function duesErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  if (error instanceof Error) {
    switch (error.message) {
      case "PERIOD_EXISTS":
        return "Bu yıl ve dönem için kayıt zaten var.";
      case "NOT_FOUND":
        return "Kayıt bulunamadı.";
      case "PERIOD_INACTIVE":
        return "Pasif döneme tahakkuk yapılamaz.";
      case "INVALID_AMOUNT":
        return "Tutar sıfırdan büyük olmalıdır.";
      case "AMOUNT_EXCEEDS":
        return "Tutar kalan borçtan fazla olamaz.";
      case "ALREADY_PAID":
        return "Bu aidat zaten ödenmiş.";
      case "DUE_WAIVED":
        return "Muafiyet verilmiş aidata tahsilat yapılamaz.";
      case "HAS_PAYMENTS":
        return "Tahsilatı olan kayıt muaf edilemez.";
      case "ALREADY_WAIVED":
        return "Bu kayıt zaten muaf.";
      case "NOT_WAIVED":
        return "Bu kayıt muaf değil.";
      case "INVALID_DATE":
        return "Geçersiz tarih.";
      default:
        break;
    }
  }
  return fallback;
}

async function assertDuesCollect() {
  return requireAdminPermission("dues.collect");
}

export async function createDuesPeriodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertDuesCollect();

  const input: DuesPeriodCreateInput = {
    year: Number(str(formData, "year")),
    period: str(formData, "period") || "yillik",
    title: str(formData, "title"),
    dueDate: str(formData, "dueDate"),
    amount: str(formData, "amount"),
    active: bool(formData, "active"),
  };

  try {
    const created = await createDuesPeriod(input);
    revalidatePath(routes.admin.dues);
    redirect(routes.admin.duesPeriodEdit(created.id));
  } catch (error) {
    rethrowRedirect(error);
    return { error: duesErrorMessage(error, "Dönem oluşturulamadı.") };
  }
}

export async function saveDuesPeriodAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertDuesCollect();

  const input: DuesPeriodCreateInput = {
    year: Number(str(formData, "year")),
    period: str(formData, "period") || "yillik",
    title: str(formData, "title"),
    dueDate: str(formData, "dueDate"),
    amount: str(formData, "amount"),
    active: bool(formData, "active"),
  };

  try {
    await updateDuesPeriod(id, input);
    revalidatePath(routes.admin.dues);
    revalidatePath(routes.admin.duesPeriodEdit(id));
    return {
      success: true,
      message:
        "Dönem kaydedildi. Tutar veya vade değiştiyse açık tahakkukları ayrıca senkronize edin.",
    };
  } catch (error) {
    return { error: duesErrorMessage(error, "Dönem kaydedilemedi.") };
  }
}

export async function assessDuesPeriodAction(
  periodId: string,
): Promise<ActionState> {
  await assertDuesCollect();
  try {
    const result = await assessDuesPeriod(periodId);
    revalidatePath(routes.admin.dues);
    revalidatePath(routes.admin.duesPeriodEdit(periodId));
    return {
      success: true,
      message: `${result.created} üye için tahakkuk oluşturuldu${
        result.skipped ? `, ${result.skipped} kayıt atlandı` : ""
      }.`,
    };
  } catch (error) {
    return { error: duesErrorMessage(error, "Tahakkuk oluşturulamadı.") };
  }
}

export async function syncOpenDuesPeriodAction(
  periodId: string,
): Promise<ActionState> {
  await assertDuesCollect();
  try {
    const result = await syncOpenMemberDuesForPeriod(periodId);
    revalidatePath(routes.admin.dues);
    revalidatePath(routes.admin.duesPeriodEdit(periodId));
    const parts = [`${result.updated} açık tahakkuk güncellendi`];
    if (result.skippedPaidExceeds > 0) {
      parts.push(
        `${result.skippedPaidExceeds} kayıt atlandı (ödenen tutar yeni tahakkuktan büyük)`,
      );
    }
    return { success: true, message: `${parts.join(". ")}.` };
  } catch (error) {
    return {
      error: duesErrorMessage(error, "Açık tahakkuklar güncellenemedi."),
    };
  }
}

export async function collectDuePaymentAction(
  dueId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertDuesCollect();

  const input: CollectPaymentInput = {
    amount: str(formData, "amount"),
    method: str(formData, "method") as CollectPaymentInput["method"],
    providerReference: nullable(formData, "providerReference"),
    note: nullable(formData, "note"),
    paidAt: nullable(formData, "paidAt"),
  };

  try {
    await collectMemberDuePayment(dueId, input, session.id);
    revalidatePath(routes.admin.dues);
    revalidatePath(routes.admin.duesDetail(dueId));
    return { success: true, message: "Tahsilat kaydedildi." };
  } catch (error) {
    return { error: duesErrorMessage(error, "Tahsilat kaydedilemedi.") };
  }
}

export async function waiveDueAction(dueId: string): Promise<ActionState> {
  await assertDuesCollect();
  try {
    await waiveMemberDue(dueId);
    revalidatePath(routes.admin.dues);
    revalidatePath(routes.admin.duesDetail(dueId));
    return { success: true, message: "Aidat muaf edildi." };
  } catch (error) {
    return { error: duesErrorMessage(error, "Muafiyet uygulanamadı.") };
  }
}

export async function unwaiveDueAction(dueId: string): Promise<ActionState> {
  await assertDuesCollect();
  try {
    await unwaiveMemberDue(dueId);
    revalidatePath(routes.admin.dues);
    revalidatePath(routes.admin.duesDetail(dueId));
    return { success: true, message: "Muafiyet kaldırıldı." };
  } catch (error) {
    return { error: duesErrorMessage(error, "Muafiyet kaldırılamadı.") };
  }
}
