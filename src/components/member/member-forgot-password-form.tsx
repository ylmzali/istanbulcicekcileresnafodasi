"use client";

import { useActionState } from "react";
import {
  memberForgotPasswordAction,
  type MemberAuthState,
} from "@/app/(member)/uye/actions";
import { Field, FormActionAlert, TextInput } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { routes } from "@/lib/routes";

const initialState: MemberAuthState = {};

export function MemberForgotPasswordForm({
  labels,
}: {
  labels: {
    title: string;
    hint: string;
    identifier: string;
    submit: string;
    backToLogin: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    memberForgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          {labels.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{labels.hint}</p>
      </div>

      <Field label={labels.identifier} htmlFor="identifier" required>
        <TextInput
          format="memberLoginId"
          id="identifier"
          name="identifier"
          autoComplete="username"
          required
        />
      </Field>

      <FormActionAlert
        error={state.error}
        success={state.success}
        successMessage={state.message}
      />

      {state.devResetUrl ? (
        <p className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
          Geliştirme ortamı sıfırlama bağlantısı:{" "}
          <Link
            href={state.devResetUrl}
            className="font-medium text-[var(--color-primary-800)] underline"
          >
            {state.devResetUrl}
          </Link>
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {labels.submit}
      </Button>

      <Link
        href={routes.member.login}
        className="inline-block text-sm font-medium text-[var(--color-primary-800)] hover:underline"
      >
        {labels.backToLogin}
      </Link>
    </form>
  );
}
