import { useState, useEffect, useCallback } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { Box, Container, Flex, Heading, Text, Section, Callout } from "@radix-ui/themes";
import * as Icons from "@radix-ui/react-icons";
import { Button, Input, Card, UrlCard, UrlList } from "../components";
import type { HomePageProps, ShortenUrlActionResult } from "./types";

const URL_PATTERN = /^https?:\/\/.+/i;
const DEBOUNCE_TIME_MS = 3000; // 3 seconds between submissions

export function HomePage({ loaderData }: HomePageProps) {
  const { baseUrl, recentUrls } = loaderData;
  const actionData = useActionData<ShortenUrlActionResult>();
  const navigation = useNavigation();
  
  const [urlValue, setUrlValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [debounceRemaining, setDebounceRemaining] = useState(0);

  const isSubmitting = navigation.state === "submitting";

  // Debounce countdown effect
  useEffect(() => {
    if (!isDebouncing) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, DEBOUNCE_TIME_MS - (Date.now() - lastSubmitTime));
      setDebounceRemaining(remaining);
      
      if (remaining === 0) {
        setIsDebouncing(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isDebouncing, lastSubmitTime]);

  // Clear validation error when user types
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlValue(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  }, [validationError]);

  // Validate URL format
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setValidationError("Please enter a URL test");
      return false;
    }
    
    if (!URL_PATTERN.test(url)) {
      setValidationError("URL must start with http:// or https://");
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      setValidationError("Please enter a valid URL");
      return false;
    }
  };

  // Handle form submission with debounce
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Check debounce
    const now = Date.now();
    if (now - lastSubmitTime < DEBOUNCE_TIME_MS) {
      e.preventDefault();
      setIsDebouncing(true);
      setDebounceRemaining(DEBOUNCE_TIME_MS - (now - lastSubmitTime));
      return;
    }

    // Validate URL
    if (!validateUrl(urlValue)) {
      e.preventDefault();
      return;
    }

    // Allow submission
    setLastSubmitTime(now);
    setValidationError(null);
  };

  // Determine if there's an error to show
  const displayError = validationError || actionData?.error;

  // Calculate button text
  const getButtonText = () => {
    if (isSubmitting) return "Shortening...";
    if (isDebouncing) return `Wait ${Math.ceil(debounceRemaining / 1000)}s`;
    return "Shorten URL";
  };

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
              <Form method="post" onSubmit={handleSubmit}>
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
                      type="url"
                      placeholder="https://example.com/your-long-url"
                      required
                      size="3"
                      value={urlValue}
                      onChange={handleUrlChange}
                    />
                    <Text size="1" color="gray" mt="1">
                      Must start with http:// or https://
                    </Text>
                  </Box>

                  {/* Error Message */}
                  {displayError && (
                    <Callout.Root color="red" size="1">
                      <Callout.Icon>
                        <Icons.ExclamationTriangleIcon />
                      </Callout.Icon>
                      <Callout.Text>{displayError}</Callout.Text>
                    </Callout.Root>
                  )}

                  {/* Success Result */}
                  {actionData?.shortenedUrl && !displayError && (
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

                  <Button 
                    type="submit" 
                    fullWidth 
                    size="3"
                    disabled={isSubmitting || isDebouncing}
                  >
                    {getButtonText()}
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
