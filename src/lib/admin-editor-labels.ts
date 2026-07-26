import { getMessages } from "@/lib/i18n";
import type { RichTextEditorLabels } from "@/components/admin/rich-text-editor";

export function getAdminEditorLabels(): RichTextEditorLabels {
  return getMessages().admin.editor;
}
