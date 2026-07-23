import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getEventById } from "@/services/events";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Etkinlik Düzenle",
  robots: { index: false, follow: false },
};

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
          coverImage: event.coverImage ?? "",
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
