export interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps): React.JSX.Element {
  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mb-6 text-sm text-text-secondary">{subtitle}</p>
      )}
    </>
  );
}
