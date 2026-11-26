function publicUrl(): string {
  const value = process.env.PUBLIC_URL;
  if (!value) {
    throw new Error("PUBLIC_URL is not set");
  }
  return value.replace(/\/$/, "");
}

export function shortLinkPrefix(): string {
  return `${publicUrl()}/s/`;
}

export function shortLinkFor(code: string): string {
  return `${publicUrl()}/s/${code}`;
}
