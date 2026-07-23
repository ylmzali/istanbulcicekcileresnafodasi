import { ComingSoonView, makeComingSoonMetadata } from "@/components/admin/coming-soon";
import { getMessages } from "@/lib/i18n";

export const metadata = makeComingSoonMetadata("Başvurular");

export default function AdminApplicationsPage() {
  const a = getMessages().admin;
  return <ComingSoonView title={a.applications} />;
}
