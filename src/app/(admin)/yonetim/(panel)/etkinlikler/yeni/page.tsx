import type { Metadata } from "next";
import { EventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";

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
          eventType: "",
          location: "",
          isOnline: false,
          onlineUrl: "",
          startsAt: "",
          endsAt: "",
          capacity: "",
          registrationOpen: "",
          registrationClose: "",
          status: "draft",
          coverImage: "",
        }}
        labels={{
          title: a.title,
          slug: a.slug,
          content: a.content,
          status: a.status,
          eventType: a.eventType,
          location: a.location,
          isOnline: a.isOnline,
          onlineUrl: a.onlineUrl,
          startsAt: a.startsAt,
          endsAt: a.endsAt,
          capacity: a.capacity,
          registrationOpen: a.registrationOpen,
          registrationClose: a.registrationClose,
          coverImage: a.coverImage,
          ...getAdminUploadLabels(),
          save: a.save,
          delete: a.delete,
          back: a.back,
          statuses: a.statuses,
        }}
      />
    </div>
  );
}
