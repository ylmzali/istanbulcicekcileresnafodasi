import { ComingSoonView, makeComingSoonMetadata } from "@/components/admin/coming-soon";
import { getMessages } from "@/lib/i18n";

export const metadata = makeComingSoonMetadata("Rehber");

export default function AdminFloristsPage() {
  const a = getMessages().admin;
  return <ComingSoonView title={a.florists} />;
}
