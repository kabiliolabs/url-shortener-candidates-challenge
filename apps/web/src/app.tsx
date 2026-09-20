import * as Separator from "@radix-ui/react-separator";
import { Card, Theme } from "@radix-ui/themes";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";
import Header from "./components/Header";
import ShortenedLink from "./components/ShortenedLink";
import ShortenerForm from "./components/ShortenerForm";

export default function App() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  return (
    <Theme appearance="dark" accentColor="tomato" radius="small">
      <Tooltip.Provider delayDuration={300}>
        <main id="top">
          <Header />
          <Separator.Root className="header-separator" decorative />
          <section className="workspace" aria-labelledby="page-title">
            <div className="intro">
              <p className="eyebrow">URL SHORTENER</p>
              <h1 id="page-title">Short links,<br /><em>without the noise.</em></h1>
              <p className="intro-copy">Turn a long URL into a clean, shareable link in seconds.</p>
            </div>
            <Card className="shortener-panel" variant="surface">
              {shortUrl ? <ShortenedLink shortUrl={shortUrl} onReset={() => setShortUrl(null)} /> : <ShortenerForm onShortened={setShortUrl} />}
            </Card>
            <p className="privacy-note">No account required. Your link is ready as soon as it is created.</p>
          </section>
          <footer>FOO.bar <span>·</span> Links made useful.</footer>
        </main>
      </Tooltip.Provider>
    </Theme>
  );
}
