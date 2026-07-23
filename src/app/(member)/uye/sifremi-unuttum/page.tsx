import { PagePlaceholder } from "@/components/layout/page-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Şifremi Unuttum" };

export default function ForgotPasswordPage() {
  return (
    <PagePlaceholder
      title="Şifremi Unuttum"
      description="Şifre sıfırlama akışı kimlik doğrulama fazında eklenecektir."
    />
  );
}
