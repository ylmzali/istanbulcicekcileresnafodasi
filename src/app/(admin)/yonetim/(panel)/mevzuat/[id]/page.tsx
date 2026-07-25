import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { getResourceById, serializeResourceForForm } from "@/services/resources";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Kaynak Düzenle",
  robots: { index: false, follow: false },
};

export default async function AdminEditResourcePage({ params }: PageProps) {
  const { id } = await params;
  const resource = await getResourceById(id);
  if (!resource) notFound();

  const a = getMessages().admin;
  const values = serializeResourceForForm(resource);

  return (
    <div>
      <AdminPageHeader title={a.edit} description={resource.title} />
      <ResourceForm
        values={values}
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
