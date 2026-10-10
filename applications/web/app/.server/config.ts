export interface Config {
  databaseUrl: string;
  publicUrl: string;
}

export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const rawPublicUrl = env.PUBLIC_URL?.trim();
  if (!rawPublicUrl) {
    throw new Error("PUBLIC_URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(rawPublicUrl);
  } catch {
    throw new Error(
      `PUBLIC_URL must be an absolute http(s) URL, received "${rawPublicUrl}"`,
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `PUBLIC_URL must use http or https, received "${parsed.protocol}"`,
    );
  }

  if (parsed.search !== "" || parsed.hash !== "") {
    throw new Error(
      `PUBLIC_URL must not contain a query string or hash, received "${rawPublicUrl}"`,
    );
  }

  return {
    databaseUrl,
    publicUrl: rawPublicUrl.replace(/\/+$/, ""),
  };
}
