import { data, Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import {
  baseUrl,
  InvalidDestinationUrlError,
  ShortCodeGenerationError,
} from "@url-shortener/engine";
import { Button, ButtonLink } from "../components/button";
import { FeedbackMessage } from "../components/feedback-message";
import { PageLayout } from "../components/page-layout";
import { creationRateLimiter } from "../services/creation-rate-limiter.server";
import { shortenedUrlService } from "../services/shortened-url.server";

/** Entrega a la interfaz el prefijo público para mostrar los enlaces generados. */
export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

export function headers({ actionHeaders }: Route.HeadersArgs) {
  return actionHeaders;
}

/** Procesa la creación de un enlace y traduce errores de dominio a respuestas de formulario. */
export async function action({ context, request }: Route.ActionArgs) {
  // El límite cuenta todos los intentos, incluidos formularios inválidos o repetidos.
  const { allowed, retryAfterSeconds } = creationRateLimiter.consume(
    context.clientIp ?? "development",
  );

  if (!allowed) {
    return data(
      {
        shortenedUrl: null,
        error: `Too many link creation attempts. Please try again in ${retryAfterSeconds} seconds.`,
        isUrlInvalid: false,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string" || !url.trim()) {
    return {
      shortenedUrl: null,
      error: "URL is required",
      isUrlInvalid: true,
    };
  }

  try {
    const shortenedUrl = await shortenedUrlService.shorten(url);

    return {
      shortenedUrl: `${baseUrl}/s/${shortenedUrl.code}`,
      error: null,
      isUrlInvalid: false,
    };
  } catch (error) {
    if (error instanceof InvalidDestinationUrlError) {
      return {
        shortenedUrl: null,
        error: error.message,
        isUrlInvalid: true,
      };
    }

    if (error instanceof ShortCodeGenerationError) {
      return {
        shortenedUrl: null,
        error: "Could not generate a unique short link. Please try again.",
        isUrlInvalid: false,
      };
    }

    throw error;
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

/** Formulario de creación y presentación del resultado o error correspondiente. */
export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state !== "idle" && navigation.formMethod === "POST";
  const errorMessage = isSubmitting ? undefined : actionData?.error;
  const shortenedUrl = isSubmitting ? undefined : actionData?.shortenedUrl;
  const isUrlInvalid =
    !isSubmitting && actionData?.isUrlInvalid === true;

  return (
    <PageLayout
      title="Shorten a URL"
      description="Create a simple, shareable link in seconds."
      action={
        <ButtonLink to="/urls" variant="secondary">
          View links and statistics
        </ButtonLink>
      }
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 sm:p-8">
        <Form method="post" className="space-y-5">
          <div>
            <label
              htmlFor="destination-url"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Destination URL
            </label>
            <input
              id="destination-url"
              type="url"
              name="url"
              placeholder="https://example.com"
              autoComplete="url"
              aria-invalid={isUrlInvalid}
              aria-describedby={`url-hint${isUrlInvalid ? " url-error" : ""}`}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:opacity-60"
            />
            <p id="url-hint" className="mt-2 text-sm text-slate-400">
              Include the full address, starting with http:// or https://.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Your short links will use <span className="font-mono text-cyan-200">{baseUrl}</span>
          </p>

          <Button
            type="submit"
            loading={isSubmitting}
            loadingLabel="Creating link..."
            className="w-full"
          >
            Create short link
          </Button>
        </Form>

        {errorMessage && (
          <FeedbackMessage id="url-error" tone="error" className="mt-6">
            {errorMessage}
          </FeedbackMessage>
        )}

        {shortenedUrl && (
          <FeedbackMessage tone="success" className="mt-6">
            <p className="mb-2 font-semibold">Your short link is ready</p>
            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono underline decoration-emerald-500/60 underline-offset-4 hover:text-white"
            >
              {shortenedUrl}
            </a>
          </FeedbackMessage>
        )}
      </section>
    </PageLayout>
  );
}
