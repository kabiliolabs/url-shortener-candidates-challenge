import type { ReactNode } from "react";

type FeedbackTone = "error" | "info" | "success";

const feedbackStyles: Record<FeedbackTone, string> = {
  error: "border-red-500/50 bg-red-950/60 text-red-200",
  info: "border-cyan-500/40 bg-cyan-950/40 text-cyan-100",
  success: "border-emerald-500/40 bg-emerald-950/40 text-emerald-100",
};

interface FeedbackMessageProps {
  /** Contenido que se mostrará dentro del mensaje. */
  children: ReactNode;
  /** Clases adicionales para ajustar el espaciado o el diseño. */
  className?: string;
  id?: string;
  /** Determina el estilo y el nivel de anuncio accesible del mensaje. */
  tone: FeedbackTone;
}

/** Mensaje reutilizable para comunicar errores, información o resultados exitosos. */
export function FeedbackMessage({
  children,
  className = "",
  id,
  tone,
}: FeedbackMessageProps) {
  const isError = tone === "error";

  return (
    <div
      id={id}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`rounded-lg border p-4 ${feedbackStyles[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
