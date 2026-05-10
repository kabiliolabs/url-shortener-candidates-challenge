import { logger } from "../lib/logger.server";

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptcha(
  token: string,
  expectedAction = "shorten"
): Promise<{ success: boolean; score: number }> {
  if (process.env.NODE_ENV === "test" || process.env.RECAPTCHA_DISABLED === "true") {
    return { success: true, score: 1.0 };
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    logger.error("RECAPTCHA_SECRET_KEY is not configured");
    return { success: false, score: 0 };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
      signal: controller.signal,
    });

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      logger.warn({ errors: data["error-codes"] }, "reCAPTCHA verification failed");
      return { success: false, score: 0 };
    }

    const score = data.score ?? 0;

    if (score < 0.5) {
      return { success: false, score };
    }

    if (data.action && data.action !== expectedAction) {
      logger.warn({ expected: expectedAction, actual: data.action }, "reCAPTCHA action mismatch");
      return { success: false, score };
    }

    return { success: true, score };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      logger.warn("reCAPTCHA verification timed out");
    } else {
      logger.error({ err: error }, "reCAPTCHA verification failed");
    }
    return { success: false, score: 0 };
  } finally {
    clearTimeout(timeout);
  }
}
