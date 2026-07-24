import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailView } from "@/components/content/event-detail";
import { isValidSlug } from "@/lib/slug";
import { getPublishedEventBySlug } from "@/services/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return { title: "Etkinlik" };
  const event = await getPublishedEventBySlug(slug);
  if (!event) return { title: "Etkinlik" };
  return {
    title: event.title,
    description: event.description || undefined,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  return <EventDetailView event={event} />;
}
