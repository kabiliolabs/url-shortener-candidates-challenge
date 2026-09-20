import cors, { CorsOptions } from "cors";
import type { RequestHandler } from "express";

const getAllowedOrigins = (): string[] =>
  (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests without an Origin header, such as curl or server-to-server requests.
    callback(null, (!origin || allowedOrigins.includes(origin)));
  },

  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
};

export const corsMiddleware: RequestHandler = cors(corsOptions);
