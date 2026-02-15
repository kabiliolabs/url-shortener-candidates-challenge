export interface PageSectionProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export function PageSection({ children, maxWidth = 560 }: PageSectionProps): React.JSX.Element {
  return (
    <div
      className="mx-auto pt-8 md:pt-10"
      style={{ maxWidth: maxWidth ? `${maxWidth}px` : undefined }}
    >
      {children}
    </div>
  );
}
