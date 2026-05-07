import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface UrlCardProps {
  shortenedUrl: string
}

export function UrlCard({ shortenedUrl }: UrlCardProps) {
  return (
    <Card className="mt-6 bg-violet-400 border-4 border-double border-yellow-500 rounded-3xl -rotate-1">
      <CardHeader>
        <CardTitle className="text-lg text-lime-300 font-black uppercase">
          Your shortened URL:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href={shortenedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-200 break-all font-mono text-sm hover:text-blue-900 bg-pink-600 p-2 block"
        >
          {shortenedUrl}
        </a>
      </CardContent>
    </Card>
  )
}
