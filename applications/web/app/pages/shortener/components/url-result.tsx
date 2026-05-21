import { Box, Button, Flex, IconButton, Link, Text } from "@radix-ui/themes";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "~/components/card";

interface UrlResultProps {
  shortenedUrl: string;
}

export function UrlResult({ shortenedUrl }: UrlResultProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  }

  return (
    <Card variant="highlight" p={{ initial: "4", sm: "5" }}>
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "var(--accent-9)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Check width={16} height={16} color="white" strokeWidth={3} />
          </Box>
          <Text size="2" weight="bold" style={{ color: "var(--accent-11)" }}>
            Your shortened URL is ready
          </Text>
        </Flex>
        <Flex
          align={{ initial: "stretch", sm: "center" }}
          justify="between"
          direction={{ initial: "column", sm: "row" }}
          gap="3"
        >
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Link
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="4"
              className="code-chip"
              weight="medium"
              style={{ wordBreak: "break-all" }}
            >
              {shortenedUrl}
            </Link>
          </Box>
          <Flex gap="2">
            <Button onClick={handleCopy} variant="solid" size="2" radius="full">
              {copied ? (
                <Check width={16} height={16} />
              ) : (
                <Copy width={16} height={16} />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <IconButton variant="soft" size="2" radius="full" asChild>
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in new tab"
              >
                <ExternalLink width={16} height={16} />
              </a>
            </IconButton>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
