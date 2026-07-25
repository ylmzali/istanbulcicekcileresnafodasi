import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/content/legal-document";
import { kvkkDocument } from "@/lib/legal/content";

export const metadata: Metadata = {
  title: kvkkDocument.title,
  description: kvkkDocument.description,
};

export default function KvkkPage() {
  return <LegalDocumentView document={kvkkDocument} />;
}
