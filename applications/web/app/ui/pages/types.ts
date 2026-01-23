import type { HomeLoaderData, ShortenUrlActionResult } from "~/server";

// HomePage Types
export interface HomePageProps {
  loaderData: HomeLoaderData;
}

// ErrorPage Types
export interface ErrorPageProps {
  statusCode: number;
  title: string;
  message: string;
  stack?: string;
}

// Re-export server types for convenience
export type { HomeLoaderData, ShortenUrlActionResult };
