import type { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  tone: "success" | "error";
}

export function Alert({ children, tone }: AlertProps) {
  const toneClassName =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className={`rounded-lg border p-3 text-sm ${toneClassName}`}>
      {children}
    </div>
  );
}
