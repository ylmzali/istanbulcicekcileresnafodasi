type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-[var(--color-text)]">{title}</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        {description}
      </p>
    </div>
  );
}
