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
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <aside className="relative hidden overflow-hidden bg-[var(--color-primary-900)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            {a.brandShort}
          </p>
          <h1 className="mt-4 max-w-md text-3xl font-bold tracking-tight">
            {a.loginAsideTitle}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
            {a.loginAsideText}
          </p>
        </div>
        <p className="text-xs text-white/45">{a.brand}</p>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-20 h-72 w-72 rounded-full bg-[color-mix(in_srgb,white_8%,transparent)]"
        />
      </aside>

      <div className="flex items-center justify-center bg-[var(--color-surface-soft)] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(23,35,29,0.06)] sm:p-8">
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
    </div>
  );
}
