import type { Metadata } from "next";
import { PostsBrowsePage } from "@/components/content/posts-browse";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export const metadata: Metadata = {
  title: "Duyurular",
  description: "İstanbul Çiçekçiler Esnaf Odası duyuruları.",
};

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  return <PostsBrowsePage filter="announcement" page={page} />;
}
