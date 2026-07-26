import type { Metadata } from "next";
import { PostForm } from "@/components/admin/post-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminEditorLabels } from "@/lib/admin-editor-labels";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Yeni İçerik",
  robots: { index: false, follow: false },
};

export default function AdminNewPostPage() {
  const a = getMessages().admin;

  return (
    <div>
      <AdminPageHeader title={a.newItem} description={a.posts} />
      <PostForm
        values={{
          type: "news",
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImage: "",
          status: "draft",
          featured: false,
          seoTitle: "",
          seoDescription: "",
          publishedAt: "",
          expiresAt: "",
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
          editor: getAdminEditorLabels(),
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
