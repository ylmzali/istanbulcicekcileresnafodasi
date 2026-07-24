import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getMessages } from "@/lib/i18n";
import { getEventById } from "@/services/events";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Etkinlik Düzenle",
  robots: { index: false, follow: false },
};

function getEventFormLabels() {
  const a = getMessages().admin;
  const e = getMessages().events;
  return {
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
  };
}

export default async function AdminEditEventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const a = getMessages().admin;

  return (
    <div>
      <AdminPageHeader title={a.edit} description={event.title} />
      <EventForm
        values={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description ?? "",
          eventType: event.eventType ?? "",
          location: event.location ?? "",
          isOnline: event.isOnline,
          onlineUrl: event.onlineUrl ?? "",
          startsAt: event.startsAt.toISOString(),
          endsAt: event.endsAt?.toISOString() ?? "",
          capacity: event.capacity?.toString() ?? "",
          registrationOpen: event.registrationOpen?.toISOString() ?? "",
          registrationClose: event.registrationClose?.toISOString() ?? "",
          status: event.status,
          featured: event.featured,
          coverImage: event.coverImage ?? "",
          registrationsCount: event._count.registrations,
        }}
        labels={getEventFormLabels()}
      />
    </div>
  );
}
