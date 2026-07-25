"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  supportTrackReplyAction,
  type SupportTrackReplyState,
} from "@/app/(public)/support-actions";
import { Field, FormActionAlert, TextTextarea } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";

const initialState: SupportTrackReplyState = {};

export function SupportTrackReplyForm({ trackingNo }: { trackingNo: string }) {
  const t = getMessages().supportForms;
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    supportTrackReplyAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  if (state.ok) {
    return (
      <p
        role="status"
        className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-primary-700)_30%,transparent)] bg-[var(--color-primary-100)] px-4 py-3 text-sm text-[var(--color-primary-900)]"
      >
        {t.replySuccess}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="trackingNo" value={trackingNo} />
      <Field label={t.replyLabel} htmlFor="message" required>
        <TextTextarea format="note" id="message" name="message" rows={4} required />
      </Field>
      <FormActionAlert error={state.error} />
      <Button type="submit" disabled={pending}>
        {pending ? t.submitting : t.replySubmit}
      </Button>
    </form>
  );
}
