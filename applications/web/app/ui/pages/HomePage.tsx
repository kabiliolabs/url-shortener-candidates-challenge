import { Form, useActionData } from "react-router";
import { Box, Container, Flex, Heading, Text, Section } from "@radix-ui/themes";
import * as Icons from "@radix-ui/react-icons";
import type { HomeLoaderData, ShortenUrlActionResult } from "~/server";
import { Button, Input, Card, UrlCard, UrlList } from "../components";

interface HomePageProps {
  loaderData: HomeLoaderData;
}

export function HomePage({ loaderData }: HomePageProps) {
  const { baseUrl, recentUrls } = loaderData;
  const actionData = useActionData<ShortenUrlActionResult>();

  return (
    <Box className="app-container">
      {/* Header Section */}
      <Box className="header-section" py="9">
        <Container size="3">
          <Flex direction={{ initial: "column", md: "row" }} gap="8" align="start">
            {/* Left side - Branding */}
            <Box className="branding" style={{ flex: 1 }}>
              <Heading size="8" weight="bold" mb="4" className="main-title">
                Kabilio URL Shortener App
              </Heading>
              <Text size="4" className="subtitle">
                Welcome to the original link shortener of Kabilio made by Matias Casal
              </Text>
            </Box>

            {/* Right side - Shortener Form */}
            <Card className="shortener-card" style={{ flex: 1, maxWidth: "450px" }}>
              <Form method="post">
                <Flex direction="column" gap="4">
                  <Flex align="center" gap="2" mb="2">
                    <Icons.Link2Icon width={20} height={20} />
                    <Text weight="medium" size="3">
                      Shorten a Link
                    </Text>
                  </Flex>

                  <Box>
                    <Text size="2" weight="medium" mb="1" as="label">
                      Long URL
                    </Text>
                    <Input
                      name="url"
                      placeholder="https://example.com/very-long-url"
                      required
                      size="3"
                    />
                  </Box>

                  {actionData?.shortenedUrl && (
                    <Box className="result-section">
                      <Text size="2" weight="medium" mb="1">
                        Shortened URL
                      </Text>
                      <UrlCard
                        shortCode={actionData.shortCode || ""}
                        shortenedUrl={actionData.shortenedUrl}
                        originalUrl={actionData.originalUrl || ""}
                      />
                    </Box>
                  )}

                  {actionData?.error && (
                    <Box className="error-section" p="3">
                      <Text color="red" size="2">
                        {actionData.error}
                      </Text>
                    </Box>
                  )}

                  <Button type="submit" fullWidth size="3">
                    Shorten URL
                  </Button>

                  <Text size="1" color="gray" align="center">
                    Your shortened URL will start with {baseUrl}
                  </Text>
                </Flex>
              </Form>
            </Card>
          </Flex>
        </Container>
      </Box>

      {/* Recent URLs Section */}
      <Section className="recent-section" py="6">
        <Container size="3">
          <UrlList
            urls={recentUrls}
            title="Recent Links"
            emptyMessage="No URLs have been shortened yet. Be the first!"
          />
        </Container>
      </Section>
    </Box>
  );
}
