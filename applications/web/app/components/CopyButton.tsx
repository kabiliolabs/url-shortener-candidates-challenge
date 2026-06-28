import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const isCopied = status === 'copied';
  const hasError = status === 'error';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('error');
    }

    window.setTimeout(() => setStatus('idle'), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border transition-colors outline-none ${
        isCopied
          ? 'bg-(--color-success-bg) border-(--color-success-border) text-(--color-accent)'
          : 'bg-white/5 border-(--color-border) text-(--color-muted) hover:text-white hover:border-white/20'
      }`}
    >
      {isCopied ? 'Copied!' : hasError ? 'Copy failed' : 'Copy'}
    </button>
  );
}
