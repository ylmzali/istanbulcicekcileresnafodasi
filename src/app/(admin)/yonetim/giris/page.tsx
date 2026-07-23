import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Yönetici Girişi",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect(routes.admin.root);
  }

  const a = getMessages().admin;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-soft)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-8">
        <AdminLoginForm
          labels={{
            title: a.loginTitle,
            hint: a.loginHint,
            username: a.username,
            password: a.password,
            submit: a.submit,
          }}
        />
      </div>
    </div>
  );
}
