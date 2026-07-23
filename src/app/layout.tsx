import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "İstanbul Çiçekçiler Esnaf Odası",
    template: "%s | İstanbul Çiçekçiler Esnaf Odası",
  },
  description:
    "İstanbul Çiçekçiler Esnaf Odası kurumsal web sitesi, üye hizmetleri ve duyurular.",
  openGraph: {
    locale: "tr_TR",
    type: "website",
    siteName: "İstanbul Çiçekçiler Esnaf Odası",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col bg-[var(--color-surface)] font-sans text-[var(--color-text)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
