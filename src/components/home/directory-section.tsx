import { DirectoryMap } from "@/components/home/directory-map";
import { getMessages } from "@/lib/i18n";

export function DirectorySection() {
  const messages = getMessages();

  return (
    <section className="border-b border-[var(--color-border)] bg-white py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-[var(--color-primary-900)] sm:text-3xl">
            {messages.directory.title}
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            {messages.directory.description}
          </p>
        </div>

        <DirectoryMap mapTitle={messages.directory.title} />
      </div>
    </section>
  );
}
