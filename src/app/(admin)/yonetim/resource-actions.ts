"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireAdminSession } from "@/lib/auth/session";
import { isSlugError, slugErrorMessage } from "@/lib/resolve-slug";
import { routes } from "@/lib/routes";
import {
  createResource,
  softDeleteResource,
  updateResource,
  type ResourceCreateInput,
  type ResourceUpdateInput,
} from "@/services/resources";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return value == null ? "" : String(value);
}

function nullable(formData: FormData, key: string) {
  const value = str(formData, key).trim();
  return value.length ? value : null;
}

function rethrowRedirect(error: unknown) {
  if (isRedirectError(error)) throw error;
}

function resourceErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  if (isSlugError(error)) {
    return slugErrorMessage(error, fallback);
  }
  if (error instanceof Error && error.message === "NOT_FOUND") {
    return "Kaynak bulunamadı.";
  }
  return fallback;
}

async function assertAdmin() {
  const session = await requireAdminSession();
  if (!session) redirect(routes.admin.login);
  return session;
}

export async function createResourceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const input: ResourceCreateInput = {
    title: str(formData, "title"),
    slug: nullable(formData, "slug"),
    category: nullable(formData, "category"),
    version: nullable(formData, "version"),
    visibility: str(formData, "visibility") as ResourceCreateInput["visibility"],
    sortOrder: Number(str(formData, "sortOrder") || "0"),
    publishedAt: nullable(formData, "publishedAt"),
    fileKey: str(formData, "fileKey"),
    fileSize: nullable(formData, "fileSize")
      ? Number(str(formData, "fileSize"))
      : null,
    mimeType: nullable(formData, "mimeType"),
  };

  try {
    const created = await createResource(input);
    revalidatePath(routes.admin.resources);
    revalidatePath(routes.legislation);
    revalidatePath(routes.home);
    redirect(routes.admin.resourceEdit(created.id));
  } catch (error) {
    rethrowRedirect(error);
    return {
      error: resourceErrorMessage(error, "Kaynak oluşturulamadı."),
    };
  }
}

export async function saveResourceAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const input: ResourceUpdateInput = {
    title: str(formData, "title"),
    slug: nullable(formData, "slug"),
    category: nullable(formData, "category"),
    version: nullable(formData, "version"),
    visibility: str(formData, "visibility") as ResourceUpdateInput["visibility"],
    sortOrder: Number(str(formData, "sortOrder") || "0"),
    publishedAt: nullable(formData, "publishedAt"),
    fileKey: str(formData, "fileKey"),
    fileSize: nullable(formData, "fileSize")
      ? Number(str(formData, "fileSize"))
      : null,
    mimeType: nullable(formData, "mimeType"),
  };

  try {
    await updateResource(id, input);
    revalidatePath(routes.admin.resources);
    revalidatePath(routes.admin.resourceEdit(id));
    revalidatePath(routes.legislation);
    revalidatePath(routes.home);
    return { success: true };
  } catch (error) {
    return {
      error: resourceErrorMessage(error, "Kaynak kaydedilemedi."),
    };
  }
}

export async function deleteResourceAction(id: string) {
  await assertAdmin();
  try {
    await softDeleteResource(id);
  } catch {
    return;
  }
  revalidatePath(routes.admin.resources);
  revalidatePath(routes.legislation);
  revalidatePath(routes.home);
  redirect(routes.admin.resources);
}
