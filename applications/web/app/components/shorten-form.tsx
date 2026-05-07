import { Form, useNavigation } from "react-router"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface ShortenFormProps {
  baseUrl: string
  error?: string
}

export function ShortenForm({ baseUrl, error }: ShortenFormProps) {
  const navigation = useNavigation()
  const isLoading = navigation.state === "submitting"

  return (
    <Form method="post" className="flex flex-col gap-4">
      <Input
        type="url"
        name="url"
        placeholder="https://example.com"
        required
        disabled={isLoading}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Shortening..." : "Shorten URL"}
      </Button>
      <p className="text-muted-foreground text-xs text-center">
        Your link will start with {baseUrl}
      </p>
    </Form>
  )
}
