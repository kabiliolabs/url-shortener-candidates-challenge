import { createRouteMeta } from "../utils/route-meta.js";
import { UrlsPage } from "../components/UrlsPage";

export const meta = () =>
  createRouteMeta("All URLs | URL Shortener", "View all shortened URLs and click statistics");

export default function UrlsIndex() {
  return <UrlsPage />;
}
