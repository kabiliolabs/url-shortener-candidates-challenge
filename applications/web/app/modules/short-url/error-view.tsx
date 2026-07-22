import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Notice } from "../../components/ui/notice";

interface ShortUrlErrorViewProps {
  statusCode: string;
  title: string;
  message: string;
}

export function ShortUrlErrorView({ statusCode, title, message }: ShortUrlErrorViewProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card
        className="w-full max-w-xl"
        eyebrow={`Status ${statusCode}`}
        title={title}
        description="The redirect route is connected to the backend and reports resolution failures explicitly."
      >
        <div className="space-y-5">
          <Notice tone={statusCode === "404" ? "info" : "error"}>{message}</Notice>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Back to home
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
}