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
        className="bg-orange-200 border-4 border-blue-600 text-purple-800 placeholder-red-400 rounded focus:outline-none"
      />
      {error && <p className="text-sm text-red-700 font-bold">{error}</p>}
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-red-500 hover:bg-lime-500 text-yellow-200 border-4 border-teal-400 rounded-full cursor-pointer"
      >
        {isLoading ? "Shortening..." : "★ SHORTEN IT ★"}
      </Button>
      <p className="text-xs text-indigo-800 text-center font-bold bg-cyan-200 p-2 border-2 border-dotted border-orange-500">
        Your link will start with {baseUrl}
      </p>
    </Form>
  )
}
