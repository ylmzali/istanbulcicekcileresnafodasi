import type { Metadata } from "next";
import { FaqForm } from "@/components/admin/faq-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { listFaqCategories } from "@/services/faqs";

export const metadata: Metadata = {
  title: "Yeni SSS",
  robots: { index: false, follow: false },
};

export default async function AdminNewFaqPage() {
  const a = getMessages().admin;
  const categories = await listFaqCategories();

  return (
    <div>
      <AdminPageHeader title={a.newItem} description={a.faqs} />
      <FaqForm
        values={{
          question: "",
          answer: "",
          categoryId: "",
          status: "draft",
          sortOrder: "0",
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
