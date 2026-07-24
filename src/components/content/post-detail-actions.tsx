"use client";

import { LinkIcon, PrinterIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState } from "react";

type PostDetailActionsProps = {
  className?: string;
  compact?: boolean;
};

export function PostDetailActions({
  className,
  compact = false,
}: PostDetailActionsProps) {
  const messages = getMessages();
  const [copied, setCopied] = useState(false);

  function printPage() {
    window.print();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const buttonClass = cn(
    "inline-flex h-9 items-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary-100)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-700)] focus-visible:ring-offset-2",
    compact && "px-2.5",
  );

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label={messages.news.shareActions}
    >
      <button type="button" onClick={printPage} className={buttonClass}>
        <PrinterIcon className="h-4 w-4 shrink-0 opacity-80" />
        <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
          {messages.news.print}
        </span>
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        className={buttonClass}
        aria-live="polite"
      >
        <LinkIcon className="h-4 w-4 shrink-0 opacity-80" />
        <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
          {copied ? messages.news.linkCopied : messages.news.copyLink}
        </span>
      </button>
    </div>
  );
}
