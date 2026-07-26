import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { AdminPageHeader } from "@/components/admin/form-fields";
import { getAdminEventFormLabels } from "@/lib/admin-event-labels";
import { getMessages } from "@/lib/i18n";
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
        labels={getAdminEventFormLabels()}
      />
    </div>
  );
}
