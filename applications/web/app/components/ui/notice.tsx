import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type NoticeTone = "info" | "success" | "error";

interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: NoticeTone;
}

const tones: Record<NoticeTone, string> = {
  info: "border-black/10 bg-neutral-50 text-neutral-800",
  success: "border-black/10 bg-white text-black",
  error: "border-black/10 bg-neutral-100 text-neutral-900",
};

export function Notice({ className, tone = "info", ...props }: NoticeProps) {
  return (
    <div
      className={cn("rounded-2xl border px-4 py-3 text-sm leading-6", tones[tone], className)}
      {...props}
    />
  );
}