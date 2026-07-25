"use client";

import { useActionState } from "react";
import {
  memberResetPasswordAction,
  type MemberAuthState,
} from "@/app/(member)/uye/actions";
import { Field, FormActionAlert, TextInput } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";

const initialState: MemberAuthState = {};

export function MemberResetPasswordForm({
  token,
  labels,
}: {
  token: string;
  labels: {
    title: string;
    hint: string;
    password: string;
    passwordConfirm: string;
    submit: string;
  };
}) {
  const action = memberResetPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          {labels.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{labels.hint}</p>
      </div>

      <Field label={labels.password} htmlFor="password" required>
        <TextInput
          format="password"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      <Field label={labels.passwordConfirm} htmlFor="passwordConfirm" required>
        <TextInput
          format="password"
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      <FormActionAlert error={state.error} />

      <Button type="submit" className="w-full" disabled={pending}>
        {labels.submit}
      </Button>
    </form>
  );
}
