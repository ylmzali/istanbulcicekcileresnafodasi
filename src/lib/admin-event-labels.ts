import type { RichTextEditorLabels } from "@/components/admin/rich-text-editor";
import { getAdminEditorLabels } from "@/lib/admin-editor-labels";
import { getAdminUploadLabels } from "@/lib/admin-upload-labels";
import { getMessages } from "@/lib/i18n";

export function getAdminEventFormLabels() {
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
    eventSectionContent: a.eventSectionContent,
    eventSectionSchedule: a.eventSectionSchedule,
    eventSectionVenue: a.eventSectionVenue,
    eventSectionMedia: a.eventSectionMedia,
    eventRegistrations: a.eventRegistrations,
    eventViewPublic: a.eventViewPublic,
    online: e.online,
    editor: getAdminEditorLabels() as RichTextEditorLabels,
    save: a.save,
    delete: a.delete,
    back: a.back,
    statuses: a.statuses,
  };
}
