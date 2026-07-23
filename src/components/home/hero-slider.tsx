"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const AUTO_MS = 7000;

const slideLinks = [
  {
    primary: routes.membership.root,
    secondary: routes.corporate.root,
  },
  {
    primary: routes.florists,
    secondary: routes.membership.apply,
  },
  {
    primary: routes.member.login,
    secondary: routes.documentVerification,
  },
] as const;

export function HeroSlider() {
  const messages = getMessages();
  const slides = messages.hero.slides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || media.matches || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_MS);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <div
      className="relative flex w-full flex-1 items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="flex w-full items-center gap-3 sm:gap-4 lg:gap-5">
        <div className="min-w-0 max-w-xl flex-1">
          {/* Stacked slides: grid height = tallest slide, no jump */}
          <div className="grid">
            {slides.map((slide, slideIndex) => {
              const active = slideIndex === index;
              const links = slideLinks[slideIndex] ?? slideLinks[0];

              return (
                <div
                  key={slide.title}
                  className={`col-start-1 row-start-1 ${
                    active
                      ? "visible z-10 animate-[hero-slide-in_450ms_ease-out]"
                      : "invisible pointer-events-none"
                  }`}
                  aria-hidden={!active}
                >
                  <p className="mb-3 text-xs font-bold tracking-[0.14em] text-[var(--color-primary-100)] uppercase">
                    {slide.eyebrow}
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                    {slide.title}
                  </h1>
                  <p className="mt-5 text-base leading-7 text-white/88 sm:text-lg">
                    {slide.description}
                  </p>
                    <div className="mt-8 flex items-stretch gap-3 sm:block">
                      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
                        <Link
                          href={links.primary}
                          tabIndex={active ? 0 : -1}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-white px-5 text-sm font-semibold text-[var(--color-primary-900)] transition hover:bg-[var(--color-primary-100)]"
                        >
                          {slide.primaryCta}
                          <span aria-hidden>→</span>
                        </Link>
                        <Link
                          href={links.secondary}
                          tabIndex={active ? 0 : -1}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
                        >
                          {slide.secondaryCta}
                          <span aria-hidden>→</span>
                        </Link>
                      </div>

                      {slideIndex === 0 ? (
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {slides.map((slide, dotIndex) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => goTo(dotIndex)}
                  className={`h-1.5 rounded-full transition ${
                    dotIndex === index
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/65"
                  }`}
                  aria-label={`Slayt ${dotIndex + 1}`}
                  aria-current={dotIndex === index ? "true" : undefined}
                />
              ))}
            </div>

            <div className="flex flex-row gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label={messages.hero.prevSlide}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label={messages.hero.nextSlide}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col gap-2 self-center sm:flex">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label={messages.hero.prevSlide}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/35 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label={messages.hero.nextSlide}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Image
        src={siteConfig.experienceBadge.src}
        alt={siteConfig.experienceBadge.alt}
        width={148}
        height={148}
        className="absolute right-0 bottom-0 hidden h-[132px] w-[132px] drop-shadow-[0_10px_24px_rgba(11,61,40,0.35)] sm:block lg:h-[148px] lg:w-[148px]"
        priority
      />
    </div>
  );
}
