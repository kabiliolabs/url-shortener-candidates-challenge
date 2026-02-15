/**
 * Maps raw API/backend errors to user-friendly messages that explain
 * what went wrong and what the app expects.
 */

export function getShortenErrorMessage(rawMessage: string, status?: number): string {
  const lower = rawMessage.toLowerCase();

  if (lower.includes("url is required") || lower.includes("missing 'url'") || lower.includes("url cannot be empty")) {
    return "You didn’t enter a URL. Please enter the full web address you want to shorten (e.g. https://example.com or example.com).";
  }

  if (lower.includes("invalid url") && lower.includes("http")) {
    return "This address isn’t valid. The app only accepts links that start with http:// or https://. Please enter a full web address (e.g. https://example.com).";
  }

  if (lower.includes("url must be at most") || lower.includes("too long")) {
    return "The URL is too long. Please use a link that is 2,048 characters or less.";
  }

  if (lower.includes("invalid json") || lower.includes("request body must be")) {
    return "Something went wrong sending your request. Please try again.";
  }

  if (lower.includes("could not build shortened url") || lower.includes("missing base url")) {
    return "The app couldn’t generate a short link right now. Please try again in a moment.";
  }

  if (lower.includes("failed to generate unique short code") || lower.includes("conflict")) {
    return "The app couldn’t create a unique short link. Please try again.";
  }

  if (lower.includes("can't reach") || lower.includes("database") || lower.includes("prisma") || lower.includes("p1001") || lower.includes("p2025")) {
    return "The app is temporarily unable to save links. Please try again later.";
  }

  if (status === 500 || lower.includes("request failed: 500") || lower === "request failed: 500") {
    return "Something went wrong on our side. Please try again. If it keeps happening, try again later.";
  }

  if (status === 400 || lower.includes("request failed: 400")) {
    return "Your request couldn’t be processed. Please check that you entered a valid URL (e.g. https://example.com) and try again.";
  }

  return `Something went wrong: ${rawMessage}. Please check your URL (it should start with http:// or https://) and try again.`;
}

export function getCopyErrorMessage(): string {
  return "Your browser didn’t allow copying. You can select and copy the shortened URL from the box above.";
}

export function getEmptyResultMessage(): string {
  return "The server didn’t return a short link. Please try again.";
}

export function getListUrlsErrorMessage(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  if (lower.includes("failed to load") || lower.includes("request failed") || lower.includes("fetch")) {
    return "We couldn’t load the list of shortened URLs. Please check your connection and try again.";
  }
  if (lower.includes("database") || lower.includes("500")) {
    return "The app is temporarily unable to load the list. Please try again later.";
  }
  return `We couldn’t load the list: ${rawMessage}. Please try again.`;
}
