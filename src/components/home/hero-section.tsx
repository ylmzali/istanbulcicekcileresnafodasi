"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";
import { AnnouncementBar } from "@/components/home/announcement-bar";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import type { HeroSlide } from "@/services/banners";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_MS = 7000;

function CtaPair({
  slide,
  active,
}: {
  slide: HeroSlide;
  active: boolean;
}) {
  const hasPrimary = Boolean(slide.primaryCtaHref && slide.primaryCtaLabel);
  const hasSecondary = Boolean(
    slide.secondaryCtaHref && slide.secondaryCtaLabel,
  );

  if (!hasPrimary && !hasSecondary) return null;

  const primaryExternal = slide.primaryCtaNewTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  const secondaryExternal = slide.secondaryCtaNewTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
      {hasPrimary ? (
        <Link
          href={slide.primaryCtaHref!}
          tabIndex={active ? 0 : -1}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-white px-5 text-sm font-semibold text-[var(--color-primary-900)] transition hover:bg-[var(--color-primary-100)]"
          {...primaryExternal}
        >
          {slide.primaryCtaLabel}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
      {hasSecondary ? (
        <Link
          href={slide.secondaryCtaHref!}
          tabIndex={active ? 0 : -1}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
          {...secondaryExternal}
        >
          {slide.secondaryCtaLabel}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}

type HeroSectionProps = {
  slides: HeroSlide[];
  announcementTitle?: string | null;
  announcementHref?: string;
};

export function HeroSection({
  slides,
  announcementTitle,
  announcementHref = routes.news.root,
}: HeroSectionProps) {
  const messages = getMessages();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const progressStartedAt = useRef<number | null>(null);
  const progressElapsed = useRef(0);
  const rafRef = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    progressStartedAt.current = null;
    progressElapsed.current = 0;
    setProgress(0);
  }, [index, slides.length, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || paused || slides.length < 2) {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (progressStartedAt.current != null) {
        progressElapsed.current +=
          performance.now() - progressStartedAt.current;
        progressStartedAt.current = null;
      }
      return;
    }

    const tick = (now: number) => {
      if (progressStartedAt.current == null) {
        progressStartedAt.current = now;
      }
      const elapsed =
        progressElapsed.current + (now - progressStartedAt.current);
      const ratio = Math.min(1, elapsed / AUTO_MS);
      setProgress(ratio);

      if (ratio >= 1) {
        progressStartedAt.current = null;
        progressElapsed.current = 0;
        setIndex((current) => (current + 1) % slides.length);
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (progressStartedAt.current != null) {
        progressElapsed.current +=
          performance.now() - progressStartedAt.current;
        progressStartedAt.current = null;
      }
    };
  }, [paused, reduceMotion, slides.length, index]);

  if (slides.length === 0) return null;

  const safeIndex = index % slides.length;
  const active = slides[safeIndex];
  const backgroundSrc = siteConfig.heroImage.src;
  const showProgress = slides.length > 1 && !reduceMotion;

  return (
    <section className="relative isolate w-full overflow-hidden text-white">
      <Image
        key={typeof backgroundSrc === "string" ? backgroundSrc : "default-hero"}
        src={backgroundSrc}
        alt={siteConfig.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,61,40,0.88)_0%,rgba(11,61,40,0.68)_48%,rgba(11,61,40,0.28)_100%)]" />

      <div className="relative flex min-h-[300px] w-full flex-col sm:min-h-[340px] lg:min-h-[380px]">
        <AnnouncementBar title={announcementTitle} href={announcementHref} />

        {showProgress ? (
          <div
            className="relative h-[2px] w-full bg-white/20"
            aria-hidden="true"
          >
            <div
              className="h-full origin-left bg-white/90 will-change-[width]"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        ) : null}

        <div
          className="relative mx-auto flex w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 sm:py-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setPaused(false);
            }
          }}
        >
          <div className="relative flex w-full flex-1 items-center">
            <div className="flex w-full items-center gap-3 sm:gap-4 lg:gap-5">
              <div className="min-w-0 max-w-xl flex-1">
                <div className="grid">
                  {slides.map((slide, slideIndex) => {
                    const isActive = slideIndex === safeIndex;

                    if (slide.variant === "image_link") {
                      const href = slide.primaryCtaHref;
                      const src = slide.imageKey;
                      const media = src ? (
                        <span className="relative block aspect-[576/285] w-full">
                          <Image
                            src={src}
                            alt={slide.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 576px"
                            className="object-cover"
                            priority={slideIndex === 0}
                          />
                        </span>
                      ) : (
                        <p className="text-sm text-white/80">{slide.title}</p>
                      );

                      return (
                        <div
                          key={slide.id}
                          className={`col-start-1 row-start-1 ${
                            isActive
                              ? "visible z-10 animate-[hero-slide-in_450ms_ease-out]"
                              : "invisible pointer-events-none"
                          }`}
                          aria-hidden={!isActive}
                        >
                          {src && href ? (
                            <Link
                              href={href}
                              tabIndex={isActive ? 0 : -1}
                              className="relative block w-full overflow-hidden rounded-[16px] ring-1 ring-white/20 sm:max-w-[576px]"
                              aria-label={slide.title}
                              {...(slide.primaryCtaNewTab
                                ? {
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                  }
                                : {})}
                            >
                              {media}
                            </Link>
                          ) : src ? (
                            <div className="relative block w-full overflow-hidden rounded-[16px] ring-1 ring-white/20 sm:max-w-[576px]">
                              {media}
                            </div>
                          ) : (
                            media
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slide.id}
                        className={`col-start-1 row-start-1 ${
                          isActive
                            ? "visible z-10 animate-[hero-slide-in_450ms_ease-out]"
                            : "invisible pointer-events-none"
                        }`}
                        aria-hidden={!isActive}
                      >
                        {slide.eyebrow ? (
                          <p className="mb-3 text-xs font-bold tracking-[0.14em] text-[var(--color-primary-100)] uppercase">
                            {slide.eyebrow}
                          </p>
                        ) : null}

                        {slide.variant === "media_cta" && slide.imageKey ? (
                          <div className="relative mb-4 w-full overflow-hidden sm:h-[73px] sm:w-[328px] sm:max-w-full">
                            <Image
                              src={slide.imageKey}
                              alt=""
                              width={328}
                              height={73}
                              className="h-auto w-full object-contain object-left sm:h-full sm:object-contain"
                              priority={slideIndex === 0}
                            />
                          </div>
                        ) : null}

                        <h1
                          className={
                            slide.variant === "media_cta"
                              ? "text-lg font-semibold tracking-tight text-white/95 sm:text-xl"
                              : "text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
                          }
                        >
                          {slide.title}
                        </h1>

                        {slide.description ? (
                          <p className="mt-2 text-base leading-6 text-white/88">
                            {slide.description}
                          </p>
                        ) : null}

                        <div className="mt-8 flex items-stretch gap-3 sm:block">
                          <CtaPair slide={slide} active={isActive} />

                          {slideIndex === 0 && slide.variant === "text_cta" ? (
                            <div className="h-[calc(3rem+0.75rem+3rem)] w-[calc(3rem+0.75rem+3rem)] shrink-0 sm:hidden">
                              <Image
                                src={siteConfig.experienceBadge.src}
                                alt={siteConfig.experienceBadge.alt}
                                width={148}
                                height={148}
                                className="h-full w-full drop-shadow-[0_10px_24px_rgba(11,61,40,0.35)]"
                                priority
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {slides.length > 1 ? (
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      {slides.map((slide, dotIndex) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => goTo(dotIndex)}
                          className={`h-1.5 rounded-full transition ${
                            dotIndex === safeIndex
                              ? "w-6 bg-white"
                              : "w-1.5 bg-white/40 hover:bg-white/65"
                          }`}
                          aria-label={`Slayt ${dotIndex + 1}`}
                          aria-current={
                            dotIndex === safeIndex ? "true" : undefined
                          }
                        />
                      ))}
                    </div>

                    <div className="flex flex-row gap-2 sm:hidden">
                      <button
                        type="button"
                        onClick={() => goTo(safeIndex - 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                        aria-label={messages.hero.prevSlide}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goTo(safeIndex + 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                        aria-label={messages.hero.nextSlide}
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {slides.length > 1 ? (
                <div className="hidden shrink-0 flex-col gap-2 self-center sm:flex">
                  <button
                    type="button"
                    onClick={() => goTo(safeIndex - 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                    aria-label={messages.hero.prevSlide}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(safeIndex + 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                    aria-label={messages.hero.nextSlide}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>

            {active.variant === "text_cta" ? (
              <Image
                src={siteConfig.experienceBadge.src}
                alt={siteConfig.experienceBadge.alt}
                width={148}
                height={148}
                className="absolute right-0 bottom-0 hidden h-[132px] w-[132px] drop-shadow-[0_10px_24px_rgba(11,61,40,0.35)] sm:block lg:h-[148px] lg:w-[148px]"
                priority
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
