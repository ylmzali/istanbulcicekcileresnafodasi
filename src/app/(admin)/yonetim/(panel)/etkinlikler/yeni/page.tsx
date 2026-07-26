import type { Metadata } from "next";
import { EventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminEventFormLabels } from "@/lib/admin-event-labels";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Yeni Etkinlik",
  robots: { index: false, follow: false },
};

export default function AdminNewEventPage() {
  const a = getMessages().admin;

  return (
    <div>
      <AdminPageHeader title={a.newItem} description={a.events} />
      <EventForm
        values={{
          title: "",
          slug: "",
          description: "",
          location: "",
          isOnline: false,
          onlineUrl: "",
          startsAt: "",
          endsAt: "",
          capacity: "",
          registrationOpen: "",
          registrationClose: "",
          status: "draft",
          featured: false,
          coverImage: "",
        }}
        labels={getAdminEventFormLabels()}
      />
    </div>
  );
}
