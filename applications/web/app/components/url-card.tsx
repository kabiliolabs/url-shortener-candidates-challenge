import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface UrlCardProps {
  shortenedUrl: string
}

export function UrlCard({ shortenedUrl }: UrlCardProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm">Your shortened URL</CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href={shortenedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary break-all font-mono text-sm hover:underline"
        >
          {shortenedUrl}
        </a>
      </CardContent>
    </Card>
  )
}
