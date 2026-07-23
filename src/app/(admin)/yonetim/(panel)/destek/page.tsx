import { ComingSoonView, makeComingSoonMetadata } from "@/components/admin/coming-soon";
import { getMessages } from "@/lib/i18n";

export const metadata = makeComingSoonMetadata("Destek");

export default function AdminSupportPage() {
  const a = getMessages().admin;
  return <ComingSoonView title={a.support} />;
}
