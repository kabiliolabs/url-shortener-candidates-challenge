import { useCopyToClipboard } from "~/features/url-shortener/hooks/use-copy-to-clipboard";

interface ShortenedUrlResultProps {
  shortUrl: string;
}

export function ShortenedUrlResult({ shortUrl }: ShortenedUrlResultProps) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
      <h2 className="text-lg font-semibold text-emerald-900">Your short URL is ready</h2>
      <a
        href={shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block break-all text-sm font-medium text-emerald-800 underline"
      >
        {shortUrl}
      </a>

      <button
        type="button"
        onClick={() => void copy(shortUrl)}
        className="mt-4 rounded-lg border border-emerald-400 bg-white px-3 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
      >
        {copied ? "Copied" : "Copy URL"}
      </button>
    </section>
  );
}
