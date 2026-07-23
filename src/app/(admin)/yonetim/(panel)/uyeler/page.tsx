import { ComingSoonView, makeComingSoonMetadata } from "@/components/admin/coming-soon";
import { getMessages } from "@/lib/i18n";

export const metadata = makeComingSoonMetadata("Üyeler");

export default function AdminMembersPage() {
  const a = getMessages().admin;
  return <ComingSoonView title={a.members} />;
}
