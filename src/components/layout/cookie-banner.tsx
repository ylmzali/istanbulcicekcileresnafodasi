"use client";

import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "oda_cookie_consent_v1";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  decidedAt: string;
};

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed?.necessary !== true || typeof parsed.analytics !== "boolean") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean) {
  const value: ConsentState = {
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent("oda-cookie-consent", { detail: value }),
  );
}

export function CookieBanner() {
  const t = getMessages().cookies;
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setVisible(!readConsent());
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--color-border)] bg-white/97 p-4 shadow-[0_-12px_40px_rgba(23,35,29,0.12)] backdrop-blur print:hidden sm:p-5"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2
            id="cookie-banner-title"
            className="text-sm font-semibold text-[var(--color-text)]"
          >
            {t.title}
          </h2>
          <p
            id="cookie-banner-desc"
            className="mt-1.5 text-sm leading-6 text-[var(--color-text-muted)]"
          >
            {t.description}{" "}
            <Link
              href={routes.legal.cookies}
              className="font-medium text-[var(--color-primary-800)] underline-offset-2 hover:underline"
            >
              {t.policyLink}
            </Link>
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              className="admin-check mt-0.5"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
            />
            <span>
              <span className="font-medium">{t.analyticsLabel}</span>
              <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                {t.analyticsHint}
              </span>
            </span>
          </label>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            {t.necessaryNote}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
            onClick={() => {
              writeConsent(false);
              setVisible(false);
            }}
          >
            {t.rejectOptional}
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-bold text-white hover:bg-[var(--color-primary-700)]"
            onClick={() => {
              writeConsent(analytics);
              setVisible(false);
            }}
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
