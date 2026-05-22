import { data, type LoaderFunctionArgs } from "react-router";
import { ensureCsrfToken } from "~/lib/csrf.server";
import { getEngine } from "~/lib/engine.server";

const PAGE_SIZE = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const engine = getEngine();
  const items = await engine.listRecentUrls({ limit: PAGE_SIZE });
  const publicBase = process.env.PUBLIC_URL ?? "";
  const { token, setCookieHeader } = await ensureCsrfToken(request.headers.get("Cookie"));
  const payload = {
    baseUrl: publicBase,
    displayBase: publicBase ? `${publicBase}/s/` : "-",
    csrfToken: token,
    urls: items.map((item) => ({
      code: item.code.value,
      url: item.longUrl.value,
      clickCount: item.clickCount,
      createdAt: item.createdAt.toISOString(),
    })),
  };
  if (setCookieHeader) {
    return data(payload, { headers: { "Set-Cookie": setCookieHeader } });
  }
  return payload;
}
