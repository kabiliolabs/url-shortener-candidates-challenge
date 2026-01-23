import { Link } from "react-router";
import { Box, Container, Flex, Heading, Text, Button, Card } from "@radix-ui/themes";
import * as Icons from "@radix-ui/react-icons";
import type { ErrorPageProps } from "./types";

export function ErrorPage({ statusCode, title, message, stack }: ErrorPageProps) {
  return (
    <Box className="app-container">
      <Box className="header-section" py="9" style={{ minHeight: "100vh" }}>
        <Container size="2">
          <Flex direction="column" align="center" justify="center" gap="6" py="9">
            {/* Error Icon */}
            <Box className="error-icon">
              {statusCode === 404 ? (
                <Icons.MagnifyingGlassIcon width={80} height={80} style={{ color: "#5eead4" }} />
              ) : (
                <Icons.ExclamationTriangleIcon width={80} height={80} style={{ color: "#f87171" }} />
              )}
            </Box>

            {/* Error Code */}
            <Heading size="9" weight="bold" className="main-title" style={{ fontSize: "6rem", lineHeight: 1 }}>
              {statusCode}
            </Heading>

            {/* Error Title */}
            <Heading size="6" weight="medium" className="main-title">
              {title}
            </Heading>

            {/* Error Message */}
            <Text size="4" className="subtitle" align="center" style={{ maxWidth: "400px" }}>
              {message}
            </Text>

            {/* Action Buttons */}
            <Flex gap="4" mt="4">
              <Button size="3" asChild className="cursor-pointer">
                <Link to="/">
                  <Icons.HomeIcon width={16} height={16} />
                  Go to Home
                </Link>
              </Button>
            </Flex>

            {/* Dev Stack Trace */}
            {stack && (
              <Card style={{ marginTop: "2rem", maxWidth: "100%", overflow: "auto" }}>
                <Box p="4">
                  <Text size="2" weight="medium" mb="2">
                    Stack Trace (Development Only)
                  </Text>
                  <pre style={{ 
                    fontSize: "0.75rem", 
                    whiteSpace: "pre-wrap", 
                    wordBreak: "break-word",
                    color: "#94a3b8",
                    margin: 0
                  }}>
                    <code>{stack}</code>
                  </pre>
                </Box>
              </Card>
            )}
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
