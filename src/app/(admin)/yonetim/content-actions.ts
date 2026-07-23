"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { routes } from "@/lib/routes";
import {
  createPost,
  softDeletePost,
  updatePost,
  type PostInput,
} from "@/services/posts";
import {
  createEvent,
  softDeleteEvent,
  updateEvent,
  type EventInput,
} from "@/services/events";
import {
  createFaq,
  createFaqCategory,
  deleteFaq,
  updateFaq,
  type FaqInput,
} from "@/services/faqs";

export type ActionState = {
  error?: string;
  success?: boolean;
};

function boolFromForm(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return value == null ? "" : String(value);
}

function nullable(formData: FormData, key: string) {
  const value = str(formData, key).trim();
  return value.length ? value : null;
}

async function assertAdmin() {
  const session = await requireAdminSession();
  if (!session) {
    redirect(routes.admin.login);
  }
  return session;
}

function rethrowRedirect(error: unknown) {
  if (isRedirectError(error)) {
    throw error;
  }
}

export async function savePostAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const input: PostInput = {
    type: str(formData, "type") as PostInput["type"],
    title: str(formData, "title"),
    slug: nullable(formData, "slug") ?? undefined,
    excerpt: nullable(formData, "excerpt"),
    content: nullable(formData, "content"),
    coverImage: nullable(formData, "coverImage"),
    status: str(formData, "status") as PostInput["status"],
    featured: boolFromForm(formData.get("featured")),
    seoTitle: nullable(formData, "seoTitle"),
    seoDescription: nullable(formData, "seoDescription"),
    publishedAt: nullable(formData, "publishedAt"),
    expiresAt: nullable(formData, "expiresAt"),
  };

  try {
    if (id) {
      await updatePost(id, input);
    } else {
      const created = await createPost(input);
      revalidatePath(routes.admin.posts);
      redirect(routes.admin.postEdit(created.id));
    }
    revalidatePath(routes.admin.posts);
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return { error: "İçerik kaydedilemedi. Alanları kontrol edin." };
  }
}

export async function deletePostAction(id: string) {
  await assertAdmin();
  try {
    await softDeletePost(id);
  } catch {
    return;
  }
  revalidatePath(routes.admin.posts);
  redirect(routes.admin.posts);
}

export async function saveEventAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const capacityRaw = str(formData, "capacity").trim();
  const input: EventInput = {
    title: str(formData, "title"),
    slug: nullable(formData, "slug") ?? undefined,
    description: nullable(formData, "description"),
    eventType: nullable(formData, "eventType"),
    location: nullable(formData, "location"),
    isOnline: boolFromForm(formData.get("isOnline")),
    onlineUrl: nullable(formData, "onlineUrl"),
    startsAt: str(formData, "startsAt"),
    endsAt: nullable(formData, "endsAt"),
    capacity: capacityRaw ? Number(capacityRaw) : null,
    registrationOpen: nullable(formData, "registrationOpen"),
    registrationClose: nullable(formData, "registrationClose"),
    status: str(formData, "status") as EventInput["status"],
    coverImage: nullable(formData, "coverImage"),
  };

  try {
    if (id) {
      await updateEvent(id, input);
    } else {
      const created = await createEvent(input);
      revalidatePath(routes.admin.events);
      redirect(routes.admin.eventEdit(created.id));
    }
    revalidatePath(routes.admin.events);
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return { error: "Etkinlik kaydedilemedi. Alanları kontrol edin." };
  }
}

export async function deleteEventAction(id: string) {
  await assertAdmin();
  try {
    await softDeleteEvent(id);
  } catch {
    return;
  }
  revalidatePath(routes.admin.events);
  redirect(routes.admin.events);
}

export async function saveFaqAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const input: FaqInput = {
    question: str(formData, "question"),
    answer: str(formData, "answer"),
    categoryId: nullable(formData, "categoryId"),
    status: str(formData, "status") as FaqInput["status"],
    sortOrder: Number(str(formData, "sortOrder") || 0),
  };

  try {
    if (id) {
      await updateFaq(id, input);
    } else {
      const created = await createFaq(input);
      revalidatePath(routes.admin.faqs);
      redirect(routes.admin.faqEdit(created.id));
    }
    revalidatePath(routes.admin.faqs);
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return { error: "SSS kaydedilemedi. Alanları kontrol edin." };
  }
}

export async function deleteFaqAction(id: string) {
  await assertAdmin();
  try {
    await deleteFaq(id);
  } catch {
    return;
  }
  revalidatePath(routes.admin.faqs);
  redirect(routes.admin.faqs);
}

export async function createFaqCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  try {
    await createFaqCategory({
      name: str(formData, "name"),
      slug: nullable(formData, "slug") ?? undefined,
      sortOrder: Number(str(formData, "sortOrder") || 0),
    });
    revalidatePath(routes.admin.faqs);
    return { success: true };
  } catch {
    return { error: "Kategori eklenemedi." };
  }
}
