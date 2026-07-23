import Image from "next/image";
import type { BoardMember } from "@/lib/corporate/content";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}

export function BoardMemberCard({
  member,
  size = "md",
}: {
  member: BoardMember;
  size?: "lg" | "md";
}) {
  const large = size === "lg";

  return (
    <article className="flex w-full max-w-[220px] flex-col items-center text-center">
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-[var(--color-surface-soft)] shadow-[0_10px_28px_rgba(11,61,40,0.10)] ring-[3px] ring-white",
          "outline outline-1 outline-[var(--color-border)]",
          large ? "h-[168px] w-[168px] sm:h-[184px] sm:w-[184px]" : "h-[136px] w-[136px]",
        )}
      >
        {member.imageSrc ? (
          <Image
            src={member.imageSrc}
            alt={`${member.name} portresi`}
            fill
            sizes={large ? "184px" : "136px"}
            className="object-cover object-top"
          />
        ) : (
          <span
            aria-hidden
            className={cn(
              "flex h-full w-full items-center justify-center font-semibold tracking-wide text-[var(--color-primary-800)]",
              large ? "text-3xl" : "text-2xl",
            )}
          >
            {initials(member.name)}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-700)]">
          {member.title}
        </p>
        <h3
          className={cn(
            "font-semibold leading-snug text-[var(--color-primary-900)]",
            large ? "text-xl" : "text-[17px]",
          )}
        >
          {member.name}
        </h3>
      </div>
    </article>
  );
}

export function BoardSection({
  members,
  lead = false,
}: {
  members: BoardMember[];
  /** First member larger and alone on its row; remaining members centered below. */
  lead?: boolean;
}) {
  if (members.length === 0) return null;

  const leadMember = lead ? members[0] : null;
  const rowMembers = lead ? members.slice(1) : members;

  return (
    <section className="space-y-10">
      {leadMember ? (
        <div className="flex justify-center">
          <BoardMemberCard member={leadMember} size="lg" />
        </div>
      ) : null}

      {rowMembers.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
          {rowMembers.map((member) => (
            <BoardMemberCard key={member.id} member={member} size="md" />
          ))}
        </div>
      ) : null}
    </section>
  );
}
