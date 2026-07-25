import type {
  SupportRequestStatus,
  SupportRequestType,
} from "@/generated/prisma/client";

export const SUPPORT_TYPE_LABELS: Record<SupportRequestType, string> = {
  information: "Bilgi edinme",
  complaint: "Şikâyet",
  suggestion: "Dilek / öneri",
  support: "Destek",
};

export const SUPPORT_STATUS_LABELS: Record<SupportRequestStatus, string> = {
  new: "Yeni",
  assigned: "Atandı",
  in_progress: "İşlemde",
  waiting_for_applicant: "Başvuran bekleniyor",
  resolved: "Çözüldü",
  closed: "Kapatıldı",
};

export const SUPPORT_TERMINAL_STATUSES: SupportRequestStatus[] = [
  "resolved",
  "closed",
];

export const SUPPORT_STATUS_TRANSITIONS: Record<
  SupportRequestStatus,
  SupportRequestStatus[]
> = {
  new: ["assigned", "in_progress", "waiting_for_applicant", "resolved", "closed"],
  assigned: ["in_progress", "waiting_for_applicant", "resolved", "closed"],
  in_progress: ["waiting_for_applicant", "resolved", "closed", "assigned"],
  waiting_for_applicant: ["in_progress", "resolved", "closed"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

export function supportTypeLabel(type: SupportRequestType) {
  return SUPPORT_TYPE_LABELS[type] ?? type;
}

export function supportStatusLabel(status: SupportRequestStatus) {
  return SUPPORT_STATUS_LABELS[status] ?? status;
}
