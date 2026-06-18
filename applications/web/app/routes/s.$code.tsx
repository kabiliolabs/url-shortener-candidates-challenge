import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { resolveShortCode, AppError } from "@url-shortener/database";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const url = await resolveShortCode(params.code);
    if (!url) {
      throw new Response("Not Found", { status: 404 });
    }
    return redirect(url);
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    if (error instanceof AppError) {
      throw new Response(error.message, { status: 500 });
    }
    throw new Response("Internal Server Error", { status: 500 });
  }
}