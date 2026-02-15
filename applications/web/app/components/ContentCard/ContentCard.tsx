export interface ContentCardProps {
  children: React.ReactNode;
}

export function ContentCard({ children }: ContentCardProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-paper)] p-6 sm:p-8">
      {children}
    </div>
  );
}
