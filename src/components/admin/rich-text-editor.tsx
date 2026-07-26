"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  looksLikeHtml,
  plainTextToHtml,
  sanitizeArticleHtml,
} from "@/lib/html-sanitize";
import { cn } from "@/lib/utils";

export type RichTextEditorLabels = {
  placeholder: string;
  bold: string;
  italic: string;
  heading: string;
  bulletList: string;
  orderedList: string;
  link: string;
  unlink: string;
  image: string;
  undo: string;
  redo: string;
  uploading: string;
  uploadError: string;
  linkPrompt: string;
};

type RichTextEditorProps = {
  name: string;
  value: string;
  onChange: (html: string) => void;
  labels: RichTextEditorLabels;
  className?: string;
  id?: string;
};

function toEditorHtml(value: string) {
  if (!value.trim()) return "";
  return looksLikeHtml(value) ? value : plainTextToHtml(value);
}

export function RichTextEditor({
  name,
  value,
  onChange,
  labels,
  className,
  id,
}: RichTextEditorProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedRef = useRef(sanitizeArticleHtml(toEditorHtml(value)));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "article-inline-image",
        },
      }),
      Placeholder.configure({
        placeholder: labels.placeholder,
      }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        id: id ?? inputId,
        class:
          "rich-text-editor-content min-h-[360px] flex-1 px-4 py-4 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor: next }) => {
      const html = sanitizeArticleHtml(next.getHTML());
      lastEmittedRef.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = sanitizeArticleHtml(toEditorHtml(value));
    if (next === lastEmittedRef.current) return;
    lastEmittedRef.current = next;
    editor.commands.setContent(next || "", { emitUpdate: false });
  }, [editor, value]);

  async function uploadImage(file: File | undefined) {
    if (!file || !editor) return;
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("preset", "article-inline");
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
        credentials: "same-origin",
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { url?: string };
      };
      if (!response.ok || !payload.success || !payload.data?.url) {
        throw new Error(payload.message || labels.uploadError);
      }
      editor
        .chain()
        .focus()
        .setImage({ src: payload.data.url, alt: "" })
        .run();
    } catch {
      setError(labels.uploadError);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const next = window.prompt(labels.linkPrompt, previous || "https://");
    if (next === null) return;
    const href = next.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const withProtocol = /^https?:\/\//i.test(href) ? href : `https://${href}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: withProtocol })
      .run();
  }

  if (!editor) {
    return (
      <div
        className={cn(
          "flex min-h-[420px] w-full flex-col rounded-[12px] border border-[var(--color-border)] bg-white",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-white",
        className,
      )}
    >
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 py-2">
        <ToolbarButton
          label={labels.bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label={labels.italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label={labels.heading}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          label={labels.bulletList}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label={labels.orderedList}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label={labels.link}
          active={editor.isActive("link")}
          onClick={setLink}
        />
        <ToolbarButton
          label={labels.unlink}
          onClick={() => editor.chain().focus().unsetLink().run()}
        />
        <ToolbarButton
          label={uploading ? labels.uploading : labels.image}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        />
        <ToolbarButton
          label={labels.undo}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label={labels.redo}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => void uploadImage(event.target.files?.[0])}
      />

      {error ? (
        <p className="border-t border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-accent)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
  disabled,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "outline"}
      disabled={disabled}
      onClick={onClick}
      className="h-8 px-2.5 text-xs"
    >
      {label}
    </Button>
  );
}
