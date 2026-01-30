import type { Route } from "./+types/_index";
import { baseUrl } from "@url-shortener/engine";
import {
  ShortenUrlUseCase,
  ShortCodeGenerator,
  RedisUrlRepository,
} from "@url-shortener/engine";
import { Flex, Card, Heading } from "@radix-ui/themes";
import { UrlShortener } from "../components/UrlShortener";

export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    const repo = new RedisUrlRepository();
    const generator = new ShortCodeGenerator(repo);
    const shortenUseCase = new ShortenUrlUseCase(generator, repo);
    const shortUrl = await shortenUseCase.execute(url);
    return {
      shortenedUrl: `${baseUrl}/s/${shortUrl.code.toString()}`,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl } = loaderData;

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      className="app-center p-4 sm:p-6 lg:p-12"
    >
      <Card className="w-full max-w-2xl p-10 md:p-12 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-md border border-slate-100">
        <div className="text-center mb-8">
          <Heading size="8" align="center" className="mb-3 bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            URL Shortener
          </Heading>
          <p className="text-sm text-slate-600 max-w-prose mx-auto">
            Just paste a long web address into the box below. This will create a short link that you can share.
          </p>
        </div>
        <UrlShortener baseUrl={baseUrl} />
      </Card>
    </Flex>
  );
}