"use client";

import { useActionState } from "react";
import {
  addSupportStaffMessageAction,
  type SupportAdminActionState,
} from "@/app/(admin)/yonetim/support-actions";
import {
  Checkbox,
  Field,
  FormActionAlert,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";

const initialState: SupportAdminActionState = {};

export function SupportMessageForm({ requestId }: { requestId: string }) {
  const a = getMessages().admin;
  const [state, formAction, pending] = useActionState(
    addSupportStaffMessageAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={requestId} />
      <Field label="Görünürlük" htmlFor="visibility" required>
        <TextSelect
          id="visibility"
          name="visibility"
          required
          defaultValue="public"
        >
          <option value="public">{a.supportReplyPublic}</option>
          <option value="internal">{a.supportReplyInternal}</option>
        </TextSelect>
      </Field>
      <Field label="Mesaj" htmlFor="message" required hint={a.supportReplyHint}>
        <TextTextarea format="note" id="message" name="message" rows={4} required />
      </Field>
      <Checkbox
        id="setWaiting"
        name="setWaiting"
        value="true"
        label={a.supportSetWaiting}
        defaultChecked
      />
      <FormActionAlert
        error={state.error}
        success={state.success}
        successMessage={state.message}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
