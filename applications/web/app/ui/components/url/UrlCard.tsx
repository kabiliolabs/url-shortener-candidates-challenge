import { Box, Flex, Text, Link, IconButton, Tooltip } from "@radix-ui/themes";
import * as Icons from "@radix-ui/react-icons";
import type { UrlCardProps } from "./types";

export function UrlCard({
  shortenedUrl,
  originalUrl,
  clicks = 0,
  showActions = true,
}: UrlCardProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortenedUrl);
  };

  // Truncate long URLs for display
  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <Box className="url-card" p="3">
      <Flex direction="column" gap="1">
        <Flex align="center" justify="between" gap="2">
          <Link
            href={shortenedUrl}
            target="_blank"
            rel="noopener noreferrer"
            weight="medium"
            size="2"
            className="shortened-url"
          >
            {shortenedUrl}
          </Link>
          {showActions && (
            <Flex gap="1">
              <Tooltip content="Copy to clipboard">
                <IconButton
                  variant="ghost"
                  size="1"
                  onClick={handleCopy}
                  className="cursor-pointer"
                >
                  <Icons.CopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip content="Open in new tab">
                <IconButton
                  variant="ghost"
                  size="1"
                  asChild
                  className="cursor-pointer"
                >
                  <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
                    <Icons.ExternalLinkIcon />
                  </a>
                </IconButton>
              </Tooltip>
            </Flex>
          )}
        </Flex>
        <Text size="1" color="gray" className="original-url">
          {truncateUrl(originalUrl)}
        </Text>
        {clicks > 0 && (
          <Text size="1" color="green">
            {clicks} click{clicks !== 1 ? "s" : ""}
          </Text>
        )}
      </Flex>
    </Box>
  );
}
