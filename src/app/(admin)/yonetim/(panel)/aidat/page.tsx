import { ComingSoonView, makeComingSoonMetadata } from "@/components/admin/coming-soon";
import { getMessages } from "@/lib/i18n";

export const metadata = makeComingSoonMetadata("Aidat");

export default function AdminDuesPage() {
  const a = getMessages().admin;
  return <ComingSoonView title={a.dues} />;
}
