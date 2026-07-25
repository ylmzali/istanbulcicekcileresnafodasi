"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, TextInput } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export function SupportTrackLookupForm({
  initialTrackingNo = "",
}: {
  initialTrackingNo?: string;
}) {
  const t = getMessages().supportForms;
  const router = useRouter();
  const [value, setValue] = useState(initialTrackingNo);

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        const trackingNo = value.trim().toUpperCase();
        if (!trackingNo) return;
        router.push(routes.supportTrackQuery(trackingNo));
      }}
    >
      <Field
        label={t.trackInput}
        htmlFor="trackingNo"
        className="w-full flex-1"
      >
        <TextInput
          format="plainText"
          id="trackingNo"
          name="trackingNo"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          placeholder="DST-20260725-A1B2C3"
          autoComplete="off"
          maxLength={40}
          className="rounded-md"
        />
      </Field>
      <Button
        type="submit"
        size="sm"
        className="h-8 rounded-md px-4 text-sm sm:mb-0.5"
      >
        {t.trackSubmit}
      </Button>
    </form>
  );
}
