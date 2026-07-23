export default function MemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-[var(--color-surface-soft)]">
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
