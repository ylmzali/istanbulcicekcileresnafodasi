import type { Metadata } from "next";
import { ResourceForm } from "@/components/admin/resource-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Yeni Kaynak",
  robots: { index: false, follow: false },
};

export default function AdminNewResourcePage() {
  const a = getMessages().admin;

  return (
    <div>
      <AdminPageHeader title={a.newItem} description={a.resources} />
      <ResourceForm
        values={{
          title: "",
          slug: "",
          category: "",
          version: "",
          visibility: "public",
          sortOrder: "0",
          publishedAt: new Date().toISOString().slice(0, 10),
          fileKey: "",
          fileSize: null,
          mimeType: "",
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
          category: a.category,
          version: a.resourceVersion,
          visibility: a.resourceVisibility,
          visibilities: a.resourceVisibilities,
          sortOrder: a.sortOrder,
          publishedAt: a.publishedAt,
          file: a.resourceFile,
          fileHint: a.resourceFileHint,
          sectionBasic: a.resourceSectionBasic,
          sectionFile: a.resourceSectionFile,
          viewPublic: a.resourceViewPublic,
          save: a.save,
          delete: a.delete,
          back: a.back,
          uploadChoose: a.uploadDocumentChoose,
          uploadChange: a.uploadDocumentChange,
          uploadRemove: a.uploadDocumentRemove,
          uploadUploading: a.uploadDocumentUploading,
          uploadError: a.uploadDocumentError,
        }}
      />
    </div>
  );
}
