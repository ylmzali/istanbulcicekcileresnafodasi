import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqForm } from "@/components/admin/faq-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { getFaqById, listFaqCategories } from "@/services/faqs";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "SSS Düzenle",
  robots: { index: false, follow: false },
};

export default async function AdminEditFaqPage({ params }: PageProps) {
  const { id } = await params;
  const [faq, categories] = await Promise.all([getFaqById(id), listFaqCategories()]);
  if (!faq) notFound();

  const a = getMessages().admin;

  return (
    <div>
      <AdminPageHeader title={a.edit} description={faq.question} />
      <FaqForm
        values={{
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          categoryId: faq.categoryId ?? "",
          status: faq.status,
          sortOrder: String(faq.sortOrder),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        labels={{
          question: a.question,
          answer: a.answer,
          category: a.category,
          status: a.status,
          sortOrder: a.sortOrder,
          save: a.save,
          delete: a.delete,
          back: a.back,
          statuses: a.statuses,
        }}
      />
    </div>
  );
}
