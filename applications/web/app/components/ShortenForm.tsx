import { Form, useNavigation } from "react-router";
import { Button, Input } from "~/components/ui";

interface ShortenFormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ShortenForm({ onSubmit }: ShortenFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="recaptcha_token" id="recaptcha-token" />
      <div className="join w-full">
        <Input
          name="url"
          placeholder="https://example.com"
          required
          aria-label="URL to shorten"
          className="join-item flex-1 input-bordered"
        />
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="join-item"
        >
          Shorten
        </Button>
      </div>
    </Form>
  );
}
