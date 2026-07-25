import type { ApplicationStatus } from "@/generated/prisma/client";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Taslak",
  submitted: "Ön başvuru",
  under_review: "İnceleniyor",
  missing_documents: "Eksik belge",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal",
};

/** Statuses where the applicant may still upload documents one-by-one. */
export const APPLICATION_UPLOADABLE_STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "missing_documents",
];

export const APPLICATION_DOCUMENT_TYPE_DEFS = [
  {
    slug: "tc-kimlik-karti-fotokopisi",
    name: "T.C. Kimlik Kartı fotokopisi",
    required: true,
  },
  {
    slug: "vergi-levhasi",
    name: "Vergi levhası",
    required: true,
  },
  {
    slug: "esnaf-ve-sanatkar-sicil-tasdiknamesi",
    name: "Esnaf ve Sanatkâr Sicil Tasdiknamesi (İSTESOB)",
    required: true,
  },
  {
    slug: "ikametgah-belgesi",
    name: "İkametgâh belgesi",
    required: false,
  },
  {
    slug: "vesikalik-fotograf",
    name: "Vesikalık fotoğraf",
    required: true,
  },
  {
    slug: "is-yeri-acilisi-belgeleri",
    name: "İş yeri açılışına ilişkin belgeler",
    required: false,
  },
] as const;

export type ApplicationDocumentSlug =
  (typeof APPLICATION_DOCUMENT_TYPE_DEFS)[number]["slug"];

export function applicationStatusLabel(status: ApplicationStatus) {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}
