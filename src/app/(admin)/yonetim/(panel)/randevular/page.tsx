import { ComingSoonView, makeComingSoonMetadata } from "@/components/admin/coming-soon";
import { getMessages } from "@/lib/i18n";

export const metadata = makeComingSoonMetadata("Randevular");

export default function AdminAppointmentsPage() {
  const a = getMessages().admin;
  return <ComingSoonView title={a.appointments} />;
}
