import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Theme } from "~/lib/theme.client";

type Props = {
  baseUrl: string;
  theme: Theme;
  onToggleTheme: () => void;
};

export function HeaderBar({ baseUrl, theme, onToggleTheme }: Props) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">URL Shortener</h1>
        <p className="text-sm text-muted-foreground">
          Shorten URLs, redirect, and track clicks.{" "}
          <span className="hidden sm:inline">Prefix: {baseUrl}</span>
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onToggleTheme}
        className="cursor-pointer"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  );
}
