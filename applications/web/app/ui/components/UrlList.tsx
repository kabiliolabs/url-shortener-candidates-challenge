import { Box, Flex, Heading, Text, Separator } from "@radix-ui/themes";
import { UrlCard } from "./UrlCard";

interface UrlItem {
  shortCode: string;
  shortenedUrl: string;
  originalUrl: string;
  clicks: number;
}

interface UrlListProps {
  urls: UrlItem[];
  title?: string;
  emptyMessage?: string;
}

export function UrlList({
  urls,
  title = "Recent Links",
  emptyMessage = "No URLs created yet",
}: UrlListProps) {
  if (urls.length === 0) {
    return (
      <Box className="url-list-empty">
        <Text color="gray" size="2">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box className="url-list">
      <Heading size="3" mb="3" weight="medium">
        {title}
      </Heading>
      <Flex direction="column" gap="2">
        {urls.map((url, index) => (
          <Box key={url.shortCode}>
            <UrlCard
              shortCode={url.shortCode}
              shortenedUrl={url.shortenedUrl}
              originalUrl={url.originalUrl}
              clicks={url.clicks}
            />
            {index < urls.length - 1 && <Separator size="4" my="2" />}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
