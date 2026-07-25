"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveMemberPostLoginPath, routes } from "@/lib/routes";
import {
  loginMember,
  logoutMember,
  requestMemberPasswordReset,
  resetMemberPassword,
} from "@/services/auth";

export type MemberAuthState = {
  error?: string;
  success?: boolean;
  message?: string;
  devResetUrl?: string;
};

function clientMeta(headerStore: Headers) {
  return {
    ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: headerStore.get("user-agent"),
  };
}

export async function memberLoginAction(
  _prev: MemberAuthState,
  formData: FormData,
): Promise<MemberAuthState> {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  const rememberMe =
    formData.get("rememberMe") === "on" ||
    formData.get("rememberMe") === "true";
  const returnKey = String(formData.get("return") ?? "") || null;

  const headerStore = await headers();
  const result = await loginMember(
    { identifier, password, rememberMe },
    clientMeta(headerStore),
  );

  if (!result.ok) {
    return { error: result.message };
  }

  redirect(resolveMemberPostLoginPath(returnKey));
}

export async function memberLogoutAction() {
  await logoutMember();
  redirect(routes.member.login);
}

export async function memberForgotPasswordAction(
  _prev: MemberAuthState,
  formData: FormData,
): Promise<MemberAuthState> {
  const identifier = String(formData.get("identifier") ?? "");
  const headerStore = await headers();
  const result = await requestMemberPasswordReset(
    { identifier },
    { ip: clientMeta(headerStore).ip },
  );

  if (!result.ok) {
    return { error: result.message };
  }

  return {
    success: true,
    message: result.message,
    devResetUrl: result.devResetUrl,
  };
}

export async function memberResetPasswordAction(
  token: string,
  _prev: MemberAuthState,
  formData: FormData,
): Promise<MemberAuthState> {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password !== passwordConfirm) {
    return { error: "Şifreler eşleşmiyor." };
  }

  const headerStore = await headers();
  const result = await resetMemberPassword(
    { token, password },
    { ip: clientMeta(headerStore).ip },
  );

  if (!result.ok) {
    return { error: result.message };
  }

  redirect(routes.member.login);
}
