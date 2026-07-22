import { useState } from "react";
import { Button } from "./button";

interface CopyButtonProps {
  value: string;
}

export function CopyButton({ value }: CopyButtonProps) {
  const [label, setLabel] = useState("Copy");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setLabel("Copied");
      window.setTimeout(() => setLabel("Copy"), 1800);
    } catch {
      setLabel("Failed");
      window.setTimeout(() => setLabel("Copy"), 1800);
    }
  }

  return (
    <Button variant="secondary" onClick={handleCopy} className="shrink-0 px-3 py-2 text-xs">
      {label}
    </Button>
  );
}