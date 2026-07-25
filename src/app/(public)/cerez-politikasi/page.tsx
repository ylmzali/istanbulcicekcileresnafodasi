import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/content/legal-document";
import { cookiesDocument } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: cookiesDocument.title,
  description: cookiesDocument.description,
};

export default function CookiesPolicyPage() {
  return <LegalDocumentView document={cookiesDocument} />;
}
