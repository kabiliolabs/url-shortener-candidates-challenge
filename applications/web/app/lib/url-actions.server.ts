import { redirect } from "react-router";
import { deleteUrlUseCase, UrlNotFoundError } from "@url-shortener/engine";

export async function deleteUrlFromForm(request: Request): Promise<Response> {
  const formData = await request.formData();
  const shortCode = formData.get("code");

  if (typeof shortCode !== "string" || shortCode.length === 0) {
    return new Response("Missing short code", { status: 400 });
  }

  try {
    await deleteUrlUseCase.execute(shortCode);
  } catch (error) {
    if (!(error instanceof UrlNotFoundError)) {
      throw error;
    }
  }

  return redirect("/stats");
}
