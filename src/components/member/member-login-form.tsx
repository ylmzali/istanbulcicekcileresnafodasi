"use client";

import { useActionState, useState } from "react";
import {
  memberLoginAction,
  type MemberAuthState,
} from "@/app/(member)/uye/actions";
import {
  Checkbox,
  Field,
  FormActionAlert,
  TextInput,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import Link from "next/link";

const initialState: MemberAuthState = {};

type MemberLoginFormProps = {
  returnKey?: string | null;
  labels: {
    title: string;
    hint: string;
    identifier: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    submit: string;
    showPassword: string;
    hidePassword: string;
    becomeMember?: string;
  };
  variant?: "page" | "hub";
};

export function MemberLoginForm({
  returnKey,
  labels,
  variant = "page",
}: MemberLoginFormProps) {
  const [state, formAction, pending] = useActionState(
    memberLoginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const isHub = variant === "hub";

  return (
    <form action={formAction} className={isHub ? "flex flex-1 flex-col gap-3.5" : "space-y-4"}>
      {returnKey ? <input type="hidden" name="return" value={returnKey} /> : null}

      {!isHub ? (
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            {labels.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{labels.hint}</p>
        </div>
      ) : null}

      {isHub ? (
        <>
          <div>
            <label htmlFor="member-identifier" className="sr-only">
              {labels.identifier}
            </label>
            <TextInput
              format="memberLoginId"
              id="member-identifier"
              name="identifier"
              autoComplete="username"
              required
              placeholder={labels.identifier}
              className="h-11 w-full rounded-[10px] border-0 bg-white px-3 text-sm text-[var(--color-text)] outline-none ring-2 ring-transparent placeholder:text-[var(--color-text-muted)] focus:ring-white/50"
            />
          </div>
          <div className="relative">
            <label htmlFor="member-password" className="sr-only">
              {labels.password}
            </label>
            <TextInput
              format="password"
              id="member-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder={labels.password}
              className="h-11 w-full rounded-[10px] border-0 bg-white px-3 pr-24 text-sm text-[var(--color-text)] outline-none ring-2 ring-transparent placeholder:text-[var(--color-text-muted)] focus:ring-white/50"
            />
            <button
              type="button"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-medium text-[var(--color-primary-800)]"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? labels.hidePassword : labels.showPassword}
            </button>
          </div>
        </>
      ) : (
        <>
          <Field label={labels.identifier} htmlFor="identifier" required>
            <TextInput
              format="memberLoginId"
              id="identifier"
              name="identifier"
              autoComplete="username"
              required
            />
          </Field>
          <Field label={labels.password} htmlFor="password" required>
            <div className="relative">
              <TextInput
                format="password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-medium text-[var(--color-primary-800)]"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? labels.hidePassword : labels.showPassword}
              </button>
            </div>
          </Field>
          <Checkbox
            id="member-remember-me"
            name="rememberMe"
            value="true"
            label={labels.rememberMe}
            className="min-h-11"
          />
        </>
      )}

      {state.error ? (
        isHub ? (
          <p role="alert" className="rounded-[10px] bg-white/12 px-3 py-2 text-sm text-white">
            {state.error}
          </p>
        ) : (
          <FormActionAlert error={state.error} />
        )
      ) : null}

      {isHub ? (
        <div className="flex items-center justify-between gap-3">
          <Checkbox
            id="member-hub-remember-me"
            name="rememberMe"
            value="true"
            label={labels.rememberMe}
            tone="onDark"
            className="min-h-11 text-xs"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-white px-4 text-sm font-bold text-[var(--color-primary-900)] transition hover:bg-[var(--color-primary-100)] disabled:opacity-60"
          >
            {labels.submit}
          </button>
        </div>
      ) : (
        <Button type="submit" className="w-full" disabled={pending}>
          {labels.submit}
        </Button>
      )}

      <div
        className={
          isHub
            ? "mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-xs text-white/80"
            : "flex flex-wrap items-center justify-between gap-2 text-sm"
        }
      >
        <Link
          href={routes.member.forgotPassword}
          className={isHub ? "hover:text-white" : "text-[var(--color-primary-800)] hover:underline"}
        >
          {labels.forgotPassword}
        </Link>
        {isHub && labels.becomeMember ? (
          <Link
            href={routes.membership.apply}
            className="hover:text-white"
          >
            {labels.becomeMember}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
