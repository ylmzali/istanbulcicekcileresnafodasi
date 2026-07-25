import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/content/legal-document";
import { privacyDocument } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: privacyDocument.title,
  description: privacyDocument.description,
};

export default function PrivacyPage() {
  return <LegalDocumentView document={privacyDocument} />;
}
