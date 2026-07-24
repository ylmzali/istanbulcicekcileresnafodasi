"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { slugErrorMessage } from "@/lib/resolve-slug";
import { routes } from "@/lib/routes";
import {
  createPost,
  movePostSort,
  setPostFeatured,
  softDeletePost,
  updatePost,
  type PostInput,
} from "@/services/posts";
import {
  createEvent,
  moveEventSort,
  setEventFeatured,
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
import {
  createBanner,
  deleteBanner,
  moveBannerSort,
  setBannerActive,
  updateBanner,
  type BannerInput,
} from "@/services/banners";

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
    revalidatePath(routes.home);
    revalidatePath(routes.news.root);
    revalidatePath(routes.news.chamber);
    revalidatePath(routes.news.sector);
    revalidatePath(routes.announcements.root);
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return {
      error: slugErrorMessage(
        error,
        "İçerik kaydedilemedi. Alanları kontrol edin.",
      ),
    };
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

export async function setPostFeaturedAction(id: string, featured: boolean) {
  await assertAdmin();
  try {
    await setPostFeatured(id, featured);
  } catch {
    return;
  }
  revalidatePath(routes.admin.posts);
  revalidatePath(routes.home);
  revalidatePath(routes.news.root);
  revalidatePath(routes.news.chamber);
  revalidatePath(routes.news.sector);
  revalidatePath(routes.announcements.root);
}

export async function movePostSortAction(
  id: string,
  direction: "up" | "down",
) {
  await assertAdmin();
  try {
    await movePostSort(id, direction);
  } catch {
    return;
  }
  revalidatePath(routes.admin.posts);
  revalidatePath(routes.home);
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
    featured: boolFromForm(formData.get("featured")),
    coverImage: nullable(formData, "coverImage"),
  };

  try {
    if (id) {
      await updateEvent(id, input);
    } else {
      const created = await createEvent(input);
      revalidatePath(routes.admin.events);
      revalidatePath(routes.events.root);
      revalidatePath(routes.home);
      redirect(routes.admin.eventEdit(created.id));
    }
    revalidatePath(routes.admin.events);
    revalidatePath(routes.events.root);
    revalidatePath(routes.home);
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return {
      error: slugErrorMessage(
        error,
        "Etkinlik kaydedilemedi. Alanları kontrol edin.",
      ),
    };
  }
}

export async function setEventFeaturedAction(id: string, featured: boolean) {
  await assertAdmin();
  try {
    await setEventFeatured(id, featured);
  } catch {
    return;
  }
  revalidatePath(routes.admin.events);
  revalidatePath(routes.events.root);
  revalidatePath(routes.home);
}

export async function moveEventSortAction(
  id: string,
  direction: "up" | "down",
) {
  await assertAdmin();
  try {
    await moveEventSort(id, direction);
  } catch {
    return;
  }
  revalidatePath(routes.admin.events);
  revalidatePath(routes.events.root);
  revalidatePath(routes.home);
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
  } catch (error) {
    return { error: slugErrorMessage(error, "Kategori eklenemedi.") };
  }
}

export async function saveBannerAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const input: BannerInput = {
    variant: str(formData, "variant") as BannerInput["variant"],
    eyebrow: nullable(formData, "eyebrow"),
    title: str(formData, "title"),
    description: nullable(formData, "description"),
    imageKey: nullable(formData, "imageKey"),
    mobileImageKey: nullable(formData, "mobileImageKey"),
    primaryCtaLabel: nullable(formData, "primaryCtaLabel"),
    primaryCtaHref: nullable(formData, "primaryCtaHref"),
    primaryCtaNewTab: boolFromForm(formData.get("primaryCtaNewTab")),
    secondaryCtaLabel: nullable(formData, "secondaryCtaLabel"),
    secondaryCtaHref: nullable(formData, "secondaryCtaHref"),
    secondaryCtaNewTab: boolFromForm(formData.get("secondaryCtaNewTab")),
    sortOrder: Number(str(formData, "sortOrder") || 0),
    active: boolFromForm(formData.get("active")),
    startsAt: nullable(formData, "startsAt"),
    endsAt: nullable(formData, "endsAt"),
  };

  try {
    if (id) {
      await updateBanner(id, input);
    } else {
      const created = await createBanner(input);
      revalidatePath(routes.admin.banners);
      revalidatePath(routes.home);
      redirect(routes.admin.bannerEdit(created.id));
    }
    revalidatePath(routes.admin.banners);
    revalidatePath(routes.home);
    return { success: true };
  } catch (error) {
    rethrowRedirect(error);
    return { error: "Hero slaytı kaydedilemedi. Alanları kontrol edin." };
  }
}

export async function deleteBannerAction(id: string) {
  await assertAdmin();
  try {
    await deleteBanner(id);
  } catch {
    return;
  }
  revalidatePath(routes.admin.banners);
  revalidatePath(routes.home);
  redirect(routes.admin.banners);
}

export async function moveBannerSortAction(
  id: string,
  direction: "up" | "down",
) {
  await assertAdmin();
  try {
    await moveBannerSort(id, direction);
  } catch {
    return;
  }
  revalidatePath(routes.admin.banners);
  revalidatePath(routes.home);
}

export async function setBannerActiveAction(id: string, active: boolean) {
  await assertAdmin();
  try {
    await setBannerActive(id, active);
  } catch {
    return;
  }
  revalidatePath(routes.admin.banners);
  revalidatePath(routes.home);
}
