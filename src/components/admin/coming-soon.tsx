import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";

type Props = { title: string };

export function makeComingSoonMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export function ComingSoonView({ title }: Props) {
  const a = getMessages().admin;
  return (
    <div>
      <AdminPageHeader title={title} description={a.comingSoon} />
    </div>
  );
}
