import { useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import { HomePage } from "../modules/home/home-page";
import { createHomePageState } from "../modules/home/presenter";
import { loadHomeData, submitShortUrlForm } from "../modules/home/server";

export async function loader() {
  return loadHomeData();
}

export async function action({ request }: Route.ActionArgs) {
  return submitShortUrlForm(request);
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const state = createHomePageState({
    loaderData,
    actionData,
    navigation,
  });

  return <HomePage state={state} />;
}
