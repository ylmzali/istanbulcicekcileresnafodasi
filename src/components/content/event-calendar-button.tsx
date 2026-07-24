"use client";

import { CalendarIcon } from "@/components/ui/icons";
import { buildEventIcs } from "@/lib/calendar-ics";

type EventAddToCalendarButtonProps = {
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  url: string;
  uid: string;
  label: string;
};

export function EventAddToCalendarButton({
  title,
  description,
  location,
  startsAt,
  endsAt,
  url,
  uid,
  label,
}: EventAddToCalendarButtonProps) {
  function downloadIcs() {
    const ics = buildEventIcs({
      title,
      description,
      location,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      url,
      uid,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${uid.split("@")[0] || "etkinlik"}.ics`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <button
      type="button"
      onClick={downloadIcs}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-700)]"
    >
      <CalendarIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
