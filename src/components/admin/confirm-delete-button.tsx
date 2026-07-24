"use client";

import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

type ConfirmDeleteButtonProps = {
  action: () => void | Promise<void>;
  label: string;
};

export function ConfirmDeleteButton({
  action,
  label,
}: ConfirmDeleteButtonProps) {
  const messages = getMessages().admin;
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pending]);

  function confirm() {
    startTransition(async () => {
      await action();
    });
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="danger"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              role="presentation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-[var(--color-text)]/45"
                aria-label={messages.deleteCancel}
                disabled={pending}
                onClick={() => {
                  if (!pending) setOpen(false);
                }}
              />
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl"
              >
                <h2
                  id={titleId}
                  className="text-lg font-semibold text-[var(--color-text)]"
                >
                  {messages.deleteConfirmTitle}
                </h2>
                <p
                  id={descriptionId}
                  className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]"
                >
                  {messages.deleteConfirmMessage}
                </p>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <Button
                    ref={cancelRef}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setOpen(false)}
                  >
                    {messages.deleteCancel}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={pending}
                    onClick={confirm}
                  >
                    {pending
                      ? messages.deleteConfirmPending
                      : messages.deleteConfirm}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
