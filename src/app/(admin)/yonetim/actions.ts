"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { loginAdmin, logoutAdmin } from "@/services/auth";

export type AdminLoginState = {
  error?: string;
};

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const headerStore = await headers();
  const result = await loginAdmin(
    { username, password },
    {
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: headerStore.get("user-agent"),
    },
  );

  if (!result.ok) {
    return { error: result.message };
  }

  redirect(routes.admin.root);
}

export async function adminLogoutAction() {
  await logoutAdmin();
  redirect(routes.admin.login);
}
