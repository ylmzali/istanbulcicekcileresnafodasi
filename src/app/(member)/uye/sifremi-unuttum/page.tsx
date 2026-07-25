import { MemberForgotPasswordForm } from "@/components/member/member-forgot-password-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  const hub = getMessages().memberHub;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Breadcrumb
        items={[
          { label: "Üye Girişi", href: routes.member.login },
          { label: "Şifremi Unuttum" },
        ]}
      />
      <div className="mt-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <MemberForgotPasswordForm
          labels={{
            title: hub.forgotPassword,
            hint: "Üye no veya T.C. kimlik numaranızı girin. Eşleşen hesap varsa sıfırlama bağlantısı e-posta adresinize iletilir.",
            identifier: hub.identifierLabel,
            submit: "Sıfırlama bağlantısı gönder",
            backToLogin: "Giriş sayfasına dön",
          }}
        />
      </div>
    </div>
  );
}
