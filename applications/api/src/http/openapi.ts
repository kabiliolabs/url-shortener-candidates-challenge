export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "URL Shortener API",
    version: "1.0.0",
    description: "HTTP API for creating, resolving, and listing shortened URLs.",
  },
  tags: [
    {
      name: "Health",
      description: "Service health check endpoints.",
    },
    {
      name: "URLs",
      description: "Create and query shortened URLs.",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          200: {
            description: "API is healthy.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/urls": {
      post: {
        tags: ["URLs"],
        summary: "Create a shortened URL",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateShortenedUrlRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Shortened URL created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShortenedUrl" },
              },
            },
          },
          400: {
            description: "Invalid request payload.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          429: {
            description: "Creation rate limit exceeded.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["URLs"],
        summary: "List recently created shortened URLs",
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of items to return.",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 50,
            },
          },
        ],
        responses: {
          200: {
            description: "List of shortened URLs.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShortenedUrlListResponse" },
              },
            },
          },
        },
      },
    },
    "/urls/{code}": {
      get: {
        tags: ["URLs"],
        summary: "Resolve a shortened URL and increment its click count",
        parameters: [
          {
            name: "code",
            in: "path",
            required: true,
            description: "Short URL code.",
            schema: {
              type: "string",
              pattern: "^[A-Za-z0-9_-]{1,32}$",
            },
          },
        ],
        responses: {
          200: {
            description: "Resolved shortened URL.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShortenedUrl" },
              },
            },
          },
          404: {
            description: "Short URL was not found.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      HealthResponse: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            example: "ok",
          },
        },
      },
      CreateShortenedUrlRequest: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            example: "https://example.com/articles/swagger",
          },
        },
      },
      ShortenedUrl: {
        type: "object",
        required: ["code", "url", "createdAt", "clicks", "shortUrl"],
        properties: {
          code: {
            type: "string",
            example: "abc123",
          },
          url: {
            type: "string",
            format: "uri",
            example: "https://example.com/articles/swagger",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-07-22T10:30:00.000Z",
          },
          clicks: {
            type: "integer",
            minimum: 0,
            example: 3,
          },
          shortUrl: {
            type: "string",
            format: "uri",
            example: "https://your-domain.com/s/abc123",
          },
        },
      },
      ShortenedUrlListResponse: {
        type: "object",
        required: ["urls"],
        properties: {
          urls: {
            type: "array",
            items: { $ref: "#/components/schemas/ShortenedUrl" },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            example: "Short URL not found",
          },
        },
      },
    },
  },
} as const;