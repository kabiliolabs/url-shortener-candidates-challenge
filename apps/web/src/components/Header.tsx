import * as Tooltip from "@radix-ui/react-tooltip";

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="FOO.bar home">
        <span className="brand-mark" aria-hidden="true">✓</span>
        <span>FOO.bar</span>
      </a>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="header-note">Simple links. Clear results.</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip-content" sideOffset={8}>
            A focused URL shortener with no account required.
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </header>
  );
}
