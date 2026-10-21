import type { HTMLAttributes } from "react";
import { cn } from "~/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

/** Single metric tile used by the statistics view. */
export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardBody className="p-4 sm:p-5">
        <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </dt>
        <dd className="mt-1.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {value}
        </dd>
      </CardBody>
    </Card>
  );
}
