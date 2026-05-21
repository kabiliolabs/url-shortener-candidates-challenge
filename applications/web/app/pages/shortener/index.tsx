import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { Sparkles } from "lucide-react";
import { useActionData, useLoaderData } from "react-router";
import { StatPill } from "~/components/stat-pill";
import { UrlList } from "~/pages/shortener/components/url-list";
import { UrlResult } from "~/pages/shortener/components/url-result";
import { UrlShortenerForm } from "~/pages/shortener/components/url-shortener-form";
import type { action } from "./actions/url-shortener-form";
import type { loader } from "./loaders/_index";

export function meta() {
  return [
    { title: "Shortly — beautifully fast URL shortener" },
    {
      name: "description",
      content: "Turn long URLs into short, shareable links. Built for speed and clarity.",
    },
  ];
}

export default function ShortenerPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const error = actionData && "error" in actionData ? actionData.error : undefined;
  const shortenedUrl =
    actionData && "shortenedUrl" in actionData ? actionData.shortenedUrl : undefined;
  const totalClicks = loaderData.urls.reduce((sum, u) => sum + u.clickCount, 0);

  return (
    <Box position="relative" overflow="hidden">
      <div className="hero-blob" aria-hidden />
      <Box
        position="relative"
        py={{ initial: "8", sm: "9" }}
        px="4"
        style={{ zIndex: 1 }}
      >
        <Container size="3">
          <Flex direction="column" gap="7">
            {/* Hero */}
            <Flex direction="column" gap="5" align="center">
              <span className="eyebrow-chip">
                <Sparkles width={14} height={14} />
                URL Shortener
              </span>
              <Heading
                as="h1"
                align="center"
                className="display-heading"
                style={{
                  fontSize: "clamp(2.75rem, 6vw, 4.75rem)",
                  maxWidth: "20ch",
                }}
              >
                Short, beautiful links in{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "var(--accent-10)",
                  }}
                >
                  seconds.
                </em>
              </Heading>
              <Text
                size="4"
                color="gray"
                align="center"
                style={{ maxWidth: "36rem", lineHeight: 1.5 }}
              >
                Turn long URLs into clean, shareable short links. Built for clarity,
                speed, and a generous touch of style.
              </Text>
              {loaderData.urls.length > 0 && (
                <Flex gap="2" wrap="wrap" justify="center" mt="2">
                  <StatPill
                    label="Links"
                    value={loaderData.urls.length.toString()}
                    tone="lavender"
                  />
                  <StatPill
                    label="Total clicks"
                    value={totalClicks.toLocaleString()}
                    tone="sky"
                  />
                  <StatPill label="Latency" value="< 50ms" tone="sage" />
                </Flex>
              )}
            </Flex>

            <UrlShortenerForm
              baseUrl={loaderData.displayBase}
              csrfToken={loaderData.csrfToken}
              error={error}
            />

            {shortenedUrl && <UrlResult shortenedUrl={shortenedUrl} />}

            <UrlList baseUrl={loaderData.baseUrl} urls={loaderData.urls} />
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
