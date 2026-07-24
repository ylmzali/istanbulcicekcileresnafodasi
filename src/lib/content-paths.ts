import type { PostType } from "@/generated/prisma/client";
import { routes } from "@/lib/routes";
import { isValidSlug } from "@/lib/slug";

export const newsCategorySegments = {
  chamber: "oda-haberleri",
  sector: "sektorden",
} as const;

export type NewsCategorySegment =
  (typeof newsCategorySegments)[keyof typeof newsCategorySegments];

export function postTypeToCategorySegment(
  type: PostType,
): NewsCategorySegment | null {
  if (type === "news") return newsCategorySegments.chamber;
  if (type === "sector") return newsCategorySegments.sector;
  return null;
}

export function categorySegmentToPostType(
  segment: string,
): Extract<PostType, "news" | "sector"> | null {
  if (segment === newsCategorySegments.chamber) return "news";
  if (segment === newsCategorySegments.sector) return "sector";
  return null;
}

export function postListHref(type?: PostType | "all") {
  if (type === "announcement") return routes.announcements.root;
  if (type === "news") return routes.news.chamber;
  if (type === "sector") return routes.news.sector;
  return routes.news.root;
}

export function postHref(type: PostType, slug: string) {
  if (!isValidSlug(slug)) {
    return postListHref(type);
  }
  if (type === "announcement") {
    return routes.announcements.detail(slug);
  }
  if (type === "news") {
    return routes.news.chamberDetail(slug);
  }
  return routes.news.sectorDetail(slug);
}

export function eventHref(slug: string) {
  if (!isValidSlug(slug)) return routes.events.root;
  return routes.events.detail(slug);
}
