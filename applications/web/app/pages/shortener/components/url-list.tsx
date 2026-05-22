import { Box, Flex, Heading, IconButton, Link, Table, Text } from "@radix-ui/themes";
import { Copy, ExternalLink, ListIcon } from "lucide-react";
import { toast } from "sonner";
import { Card } from "~/components/card";

interface UrlListEntry {
  code: string;
  url: string;
  clickCount: number;
  createdAt: string;
}

interface UrlListProps {
  baseUrl: string;
  urls: UrlListEntry[];
}

export function UrlList({ baseUrl, urls }: UrlListProps) {
  return (
    <Card p={{ initial: "5", sm: "7" }}>
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "var(--pastel-sky)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <ListIcon width={18} height={18} color="var(--accent-11)" />
          </Box>
          <Box>
            <Heading size="6" weight="medium" style={{ letterSpacing: "-0.02em" }}>
              Recent links
            </Heading>
            <Text size="2" color="gray">
              {urls.length === 0
                ? "Your shortened URLs will appear here."
                : `Showing the ${urls.length} most recent ${urls.length === 1 ? "link" : "links"}.`}
            </Text>
          </Box>
        </Flex>

        {urls.length === 0 ? (
          <Box
            style={{
              padding: "var(--space-6)",
              borderRadius: 18,
              background: "var(--gray-2)",
              textAlign: "center",
              border: "1px dashed rgba(17, 24, 39, 0.1)",
            }}
          >
            <Text size="2" color="gray">
              No links yet — shorten one above to get started.
            </Text>
          </Box>
        ) : (
          <Table.Root variant="ghost" size="2">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Short link</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="hidden md:table-cell">
                  Destination
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell justify="end">Clicks</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell justify="end">
                  <Text className="sr-only">Actions</Text>
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {urls.map(({ code, url, clickCount }) => {
                const shortUrl = `${baseUrl}/s/${code}`;
                return (
                  <Table.Row key={code} align="center">
                    <Table.Cell>
                      <Link
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="code-chip"
                        size="2"
                        weight="medium"
                      >
                        /s/{code}
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="hidden md:table-cell max-w-xs truncate">
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="gray"
                        size="2"
                      >
                        {url}
                      </Link>
                    </Table.Cell>
                    <Table.Cell
                      justify="end"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      <Box
                        style={{
                          display: "inline-flex",
                          background:
                            clickCount > 0 ? "var(--pastel-sage)" : "var(--gray-3)",
                          padding: "0.2rem 0.7rem",
                          borderRadius: 999,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "var(--ink-900)",
                        }}
                      >
                        {clickCount.toLocaleString()}
                      </Box>
                    </Table.Cell>
                    <Table.Cell justify="end">
                      <Flex gap="1" justify="end">
                        <IconButton
                          variant="ghost"
                          size="2"
                          radius="full"
                          aria-label={`Copy short URL for ${code}`}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(shortUrl);
                              toast.success("Copied to clipboard");
                            } catch {
                              toast.error("Couldn't copy");
                            }
                          }}
                        >
                          <Copy width={15} height={15} />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          size="2"
                          radius="full"
                          asChild
                          aria-label={`Open ${code} in new tab`}
                        >
                          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink width={15} height={15} />
                          </a>
                        </IconButton>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
    </Card>
  );
}
