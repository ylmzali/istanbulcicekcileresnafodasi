import type { Metadata } from "next";
import { PostsBrowsePage } from "@/components/content/posts-browse";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export const metadata: Metadata = {
  title: "Haberler",
  description:
    "İstanbul Çiçekçiler Esnaf Odası haberleri, duyuruları ve sektörden gelişmeler.",
};

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  return <PostsBrowsePage filter="all" page={page} />;
}
