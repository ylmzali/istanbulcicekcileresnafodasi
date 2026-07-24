import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function PresidentPortraitAside({
  showLeftGutter = true,
}: {
  showLeftGutter?: boolean;
}) {
  const content = getMessages().presidentMessage;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[280px] items-start lg:mx-0",
        showLeftGutter ? "gap-3.5" : null,
      )}
    >
      {showLeftGutter ? (
        <div className="w-16 shrink-0" aria-hidden />
      ) : null}

      <div className="min-w-0 flex-1 text-center">
        <div className="relative">
          <div
            className="absolute -inset-2 rounded-[22px] bg-[var(--color-primary-100)]/70"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[18px] bg-white shadow-[0_16px_36px_rgba(11,61,40,0.10)] ring-1 ring-[var(--color-border)]">
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/board/selcuk-kosedagi.jpg"
                alt={`${content.name} portresi`}
                fill
                sizes="240px"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-base font-semibold text-[var(--color-primary-900)]">
            {content.name}
          </p>
          <p className="mt-1 text-sm leading-snug text-[var(--color-text-muted)]">
            {content.role}
          </p>
        </div>
      </div>
    </div>
  );
}
