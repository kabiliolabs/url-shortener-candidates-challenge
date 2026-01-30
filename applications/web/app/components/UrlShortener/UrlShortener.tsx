import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Loader2, LinkIcon } from 'lucide-react';
import { Flex, Card, Text, Button, TextField, Separator, Callout, Box } from '@radix-ui/themes';
import { useUrlShortener } from '../../hooks/useUrlShortener';

interface UrlShortenerProps {
  baseUrl: string;
}

export const UrlShortener = ({ baseUrl }: UrlShortenerProps) => {
  const { form, shorten, isSubmitting, shortUrl, serverError, fieldError } = useUrlShortener();
  const copyRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = useCallback(async () => {
    if (shortUrl) {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('Copied to clipboard!');
    }
  }, [shortUrl]);

  return (
    <Flex width="100%" justify="center" p="4">
      <Box width="100%">
        <Card size="4" variant="ghost">
          <Flex direction="column" gap="5">

            <form onSubmit={shorten} noValidate>
              <Flex direction="column" gap="4" align="stretch">

                <Flex direction="column" gap="2">
                  <Text as="label" size="2" weight="bold" htmlFor="url-input">
                    Enter your long URL
                  </Text>
                  <TextField.Root
                    id="url-input"
                    size="3"
                    {...form.register('url')}
                    type="url"
                    placeholder="https://example.com/very/long/url"
                  >
                    <TextField.Slot>
                      <LinkIcon size={16} />
                    </TextField.Slot>
                  </TextField.Root>

                  {fieldError && (
                    <Text size="2" color="red" weight="medium">
                      {fieldError}
                    </Text>
                  )}
                </Flex>

                <Button
                  type="submit"
                  size="3"
                  variant="solid"
                  disabled={isSubmitting}
                  style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? (
                    <Flex gap="2" align="center">
                      <Loader2 size={18} className="animate-spin" />
                      <Text>Shortening...</Text>
                    </Flex>
                  ) : (
                    'Shorten URL'
                  )}
                </Button>
              </Flex>
            </form>

            <Text as="p" size="1" color="gray" align="center">
              Shortened URLs start with <Text color="indigo" weight="bold">{baseUrl}</Text>
            </Text>

            {shortUrl && (
              <Flex direction="column" gap="3" mt="2" p="3" style={{ backgroundColor: 'var(--green-2)', borderRadius: 'var(--radius-3)' }}>
                <Separator size="4" />
                <Text size="2" weight="bold" color="green">
                  Your shortened URL:
                </Text>
                <Flex gap="2">
                  <TextField.Root
                    size="3"
                    value={shortUrl}
                    readOnly
                    style={{ flexGrow: 1 }}
                  />
                  <Button
                    size="3"
                    variant="soft"
                    color="green"
                    onClick={copyToClipboard}
                    style={{ cursor: 'pointer' }}
                  >
                    <Copy size={16} />
                  </Button>
                </Flex>
              </Flex>
            )}

            {serverError && (
              <Callout.Root color="red" variant="soft">
                <Callout.Text>{serverError}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
};