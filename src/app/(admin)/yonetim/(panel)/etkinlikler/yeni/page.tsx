import type { Metadata } from "next";
import { EventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Yeni Etkinlik",
  robots: { index: false, follow: false },
};

export default function AdminNewEventPage() {
  const a = getMessages().admin;
  const e = getMessages().events;

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
          featured: false,
          coverImage: "",
        }}
        labels={{
          title: a.title,
          slug: a.slug,
          slugHint: a.slugHint,
          slugChecking: a.slugChecking,
          slugAvailable: a.slugAvailable,
          slugTaken: a.slugTaken,
          slugInvalid: a.slugInvalid,
          slugEmptyHint: a.slugEmptyHint,
          content: a.content,
          status: a.status,
          featured: a.featured,
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
          coverImageHint: a.coverImageHint,
          ...getAdminUploadLabels(),
          preview: a.preview,
          eventPreviewEmpty: a.eventPreviewEmpty,
          eventSectionBasic: a.eventSectionBasic,
          eventSectionSchedule: a.eventSectionSchedule,
          eventSectionVenue: a.eventSectionVenue,
          eventSectionMedia: a.eventSectionMedia,
          eventRegistrations: a.eventRegistrations,
          eventViewPublic: a.eventViewPublic,
          online: e.online,
          save: a.save,
          delete: a.delete,
          back: a.back,
          statuses: a.statuses,
        }}
      />
    </div>
  );
}
