import type { PostType } from "@/generated/prisma/client";

export type HomeNewsTab = "all" | "announcements" | "chamber" | "sector";

export type HomeNewsItemDto = {
  id: string;
  type: PostType;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
};

export function homeNewsTabToType(tab: HomeNewsTab): PostType | undefined {
  if (tab === "announcements") return "announcement";
  if (tab === "chamber") return "news";
  if (tab === "sector") return "sector";
  return undefined;
}

export function parseHomeNewsTab(value: string | null | undefined): HomeNewsTab {
  if (
    value === "announcements" ||
    value === "chamber" ||
    value === "sector" ||
    value === "all"
  ) {
    return value;
  }
  return "all";
}
