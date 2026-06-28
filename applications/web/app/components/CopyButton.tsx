import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border transition-colors outline-none ${
        copied
          ? 'bg-(--color-success-bg) border-(--color-success-border) text-(--color-accent)'
          : 'bg-white/5 border-(--color-border) text-(--color-muted) hover:text-white hover:border-white/20'
      }`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
