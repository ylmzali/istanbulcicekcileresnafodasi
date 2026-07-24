import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getPostById } from "@/services/posts";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "İçerik Düzenle",
  robots: { index: false, follow: false },
};

export default async function AdminEditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const a = getMessages().admin;

  return (
    <div>
      <AdminPageHeader title={a.edit} description={post.title} />
      <PostForm
        values={{
          id: post.id,
          type: post.type,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content ?? "",
          coverImage: post.coverImage ?? "",
          status: post.status,
          featured: post.featured,
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          publishedAt: post.publishedAt?.toISOString() ?? "",
          expiresAt: post.expiresAt?.toISOString() ?? "",
        }}
        labels={{
          title: a.title,
          slug: a.slug,
          slugHint: a.slugHint,
          slugChecking: a.slugChecking,
          slugAvailable: a.slugAvailable,
          slugTaken: a.slugTaken,
          slugInvalid: a.slugInvalid,
          slugEmptyHint: a.slugEmptyHint,
          excerpt: a.excerpt,
          content: a.content,
          status: a.status,
          type: a.type,
          featured: a.featured,
          publishedAt: a.publishedAt,
          expiresAt: a.expiresAt,
          coverImage: a.coverImage,
          coverImageHint: a.coverImageHint,
          ...getAdminUploadLabels(),
          seoTitle: a.seoTitle,
          seoDescription: a.seoDescription,
          preview: a.preview,
          previewEmpty: a.previewEmpty,
          seoAutoHint: a.seoAutoHint,
          postSectionBasic: a.postSectionBasic,
          postSectionContent: a.postSectionContent,
          postSectionMedia: a.postSectionMedia,
          postSectionSchedule: a.postSectionSchedule,
          postSectionSeo: a.postSectionSeo,
          postViewPublic: a.postViewPublic,
          save: a.save,
          delete: a.delete,
          back: a.back,
          postTypes: a.postTypes,
          statuses: a.statuses,
        }}
      />
    </div>
  );
}
