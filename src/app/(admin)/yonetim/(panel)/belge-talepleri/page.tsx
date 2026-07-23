import { ComingSoonView, makeComingSoonMetadata } from "@/components/admin/coming-soon";
import { getMessages } from "@/lib/i18n";

export const metadata = makeComingSoonMetadata("Belge Talepleri");

export default function AdminDocumentRequestsPage() {
  const a = getMessages().admin;
  return <ComingSoonView title={a.documentRequests} />;
}
