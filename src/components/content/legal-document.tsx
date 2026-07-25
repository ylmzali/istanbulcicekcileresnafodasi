import { Breadcrumb } from "@/components/layout/breadcrumb";
import type { LegalDocument } from "@/lib/legal/content";

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[860px] px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumb items={[{ label: document.title }]} />
        <article className="mt-2 rounded-[22px] border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_30px_rgba(23,35,29,0.04)] sm:p-10">
          <header className="border-b border-[var(--color-border)] pb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-primary-900)]">
              {document.title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
              {document.description}
            </p>
            <p className="mt-3 text-xs font-medium text-[var(--color-text-muted)]">
              {document.updatedLabel}
            </p>
          </header>

          <div className="mt-8 space-y-8">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="mt-2 text-[15px] leading-7 text-[var(--color-text-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-[var(--color-text-muted)]">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
