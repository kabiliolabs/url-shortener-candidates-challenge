import { Box, Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { ArrowRight, Link2 } from "lucide-react";
import { Form, useNavigation } from "react-router";
import { Card } from "~/components/card";

interface UrlShortenerFormProps {
  baseUrl: string;
  csrfToken: string;
  error?: string;
}

export function UrlShortenerForm({ baseUrl, csrfToken, error }: UrlShortenerFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card p={{ initial: "5", sm: "7" }}>
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "var(--pastel-lavender-soft)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Link2 width={18} height={18} color="var(--accent-11)" />
            </Box>
            <Heading size="6" weight="medium" style={{ letterSpacing: "-0.02em" }}>
              Shorten a URL
            </Heading>
          </Flex>
          <Text size="2" color="gray">
            Paste a long link and get a clean short URL starting with{" "}
            <Text className="code-chip" color="gray" size="2">
              {baseUrl}
            </Text>
          </Text>
        </Flex>

        <Form method="post">
          <input type="hidden" name="_csrf" value={csrfToken} />
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text as="label" htmlFor="url" size="2" weight="medium">
                Destination URL
              </Text>
              <TextField.Root
                id="url"
                type="url"
                name="url"
                size="3"
                radius="large"
                variant="surface"
                placeholder="https://example.com/very-long-link"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "url-error" : undefined}
                color={error ? "red" : undefined}
              />
              {error && (
                <Text id="url-error" size="2" color="red">
                  {error}
                </Text>
              )}
            </Flex>
            <Button
              type="submit"
              size="4"
              radius="full"
              disabled={isSubmitting}
              loading={isSubmitting}
              style={{ alignSelf: "flex-start", paddingInline: "1.5rem" }}
            >
              {isSubmitting ? "Shortening…" : "Shorten URL"}
              {!isSubmitting && <ArrowRight width={18} height={18} />}
            </Button>
          </Flex>
        </Form>
      </Flex>
    </Card>
  );
}
