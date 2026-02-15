import { createRouteMeta } from "../utils/route-meta.js";
import { ShortenPage } from "../components/ShortenPage";

export const meta = () => createRouteMeta("URL Shortener", "Shorten your URLs quickly and easily");

export default function Index() {
  return <ShortenPage />;
}
