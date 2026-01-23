import type { Route } from "./+types/_index";

// Server (Backend)
import { homeLoader, shortenUrlAction } from "~/server";

// UI (Frontend)
import { HomePage } from "~/ui";

// Route Configuration
export const loader = homeLoader;
export const action = shortenUrlAction;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kabilio URL Shortener" },
    { name: "description", content: "The original link shortener of Kabilio made by Matias Casal" },
  ];
}

// Route Component (connects server data to UI)
export default function Index({ loaderData }: Route.ComponentProps) {
  return <HomePage loaderData={loaderData} />;
}
