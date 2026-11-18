import { Link } from "react-router";

interface ErrorPageProps {
  status: number;
  title: string;
  message: string;
  stack?: string;
}

export function ErrorPage({ status, title, message, stack }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="text-xs font-semibold tracking-[0.35em] text-moss uppercase dark:text-sage">
          Error {status}
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-forest dark:text-cream">
          {title}
        </h1>

        <p className="mt-4 text-base text-moss dark:text-sage">{message}</p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-cream transition hover:bg-moss focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:bg-cream dark:text-forest dark:hover:bg-sage dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
        >
          Back to home
        </Link>

        {stack && (
          <pre className="mt-10 max-h-80 overflow-auto rounded-xl border border-sage/60 bg-cream/60 p-4 text-left text-xs leading-relaxed text-forest/90 dark:border-sage/25 dark:bg-cream/5 dark:text-cream/90">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
