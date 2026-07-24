import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PostDetailView } from "@/components/content/post-detail";
import { postHref } from "@/lib/content-paths";
import { isValidSlug } from "@/lib/slug";
import { getPublishedPostBySlug } from "@/services/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return { title: "Duyuru" };
  const post = await getPublishedPostBySlug(slug);
  if (!post || post.type !== "announcement") return { title: "Duyuru" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
  };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();
  if (post.type !== "announcement") {
    redirect(postHref(post.type, post.slug));
  }

  return <PostDetailView post={post} />;
}
