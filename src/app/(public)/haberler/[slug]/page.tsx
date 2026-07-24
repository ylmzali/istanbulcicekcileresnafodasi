import { notFound, redirect } from "next/navigation";
import { postHref } from "@/lib/content-paths";
import { isValidSlug } from "@/lib/slug";
import { getPublishedPostBySlug } from "@/services/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Legacy `/haberler/:slug` → category path. */
export default async function LegacyNewsDetailRedirect({ params }: PageProps) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const post = await getPublishedPostBySlug(slug);
  if (!post || post.type === "announcement") notFound();

  redirect(postHref(post.type, post.slug));
}
