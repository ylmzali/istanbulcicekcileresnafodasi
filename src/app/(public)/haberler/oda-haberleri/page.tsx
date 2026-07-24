import type { Metadata } from "next";
import { PostsBrowsePage } from "@/components/content/posts-browse";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export const metadata: Metadata = {
  title: "Oda Haberleri",
  description: "İstanbul Çiçekçiler Esnaf Odası haberleri.",
};

export default async function ChamberNewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  return <PostsBrowsePage filter="news" page={page} />;
}
