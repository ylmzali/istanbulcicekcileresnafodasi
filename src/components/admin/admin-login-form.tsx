"use client";

import { useActionState } from "react";
import { adminLoginAction, type AdminLoginState } from "@/app/(admin)/yonetim/actions";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/admin/form-fields";

const initialState: AdminLoginState = {};

type AdminLoginFormProps = {
  labels: {
    title: string;
    hint: string;
    username: string;
    password: string;
    submit: string;
  };
};

export function AdminLoginForm({ labels }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">{labels.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{labels.hint}</p>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--color-accent)]/30 bg-[color-mix(in_srgb,var(--color-accent)_8%,white)] px-3 py-2 text-sm text-[var(--color-accent)]"
        >
          {state.error}
        </p>
      ) : null}

      <Field label={labels.username} htmlFor="username">
        <TextInput
          id="username"
          name="username"
          autoComplete="username"
          required
        />
      </Field>

      <Field label={labels.password} htmlFor="password">
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <Button type="submit" className="w-full" disabled={pending}>
        {labels.submit}
      </Button>
    </form>
  );
}
