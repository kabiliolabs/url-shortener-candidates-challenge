import type { Request, Response } from "express";
import { UrlService } from "../domain/url-service.js";
import { parseDestinationUrl, parseListLimit } from "../http/request-parsers.js";
import { serializeShortenedUrl } from "../http/serializers.js";
import { RateLimiter } from "../http/rate-limiter.js";

const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export class UrlController {
  constructor(
    private readonly service: UrlService,
    private readonly publicUrl: string,
    private readonly creationRateLimiter: RateLimiter,
  ) {}

  create = async (request: Request, response: Response): Promise<void> => {
    if (!this.creationRateLimiter.tryConsume(request.ip ?? "unknown")) {
      response.status(429).json({ error: "Too many requests. Try again later." });
      return;
    }

    const shortenedUrl = await this.service.create({
      url: parseDestinationUrl(request.body),
    });
    response.status(201).json(serializeShortenedUrl(shortenedUrl, this.publicUrl));
  };

  getAll = async (request: Request, response: Response): Promise<void> => {
    const urls = await this.service.getAll(parseListLimit(request.query.limit));
    response.json({
      urls: urls.map((url) => serializeShortenedUrl(url, this.publicUrl)),
    });
  };

  getById = async (request: Request, response: Response): Promise<void> => {
    const code = request.params.code;
    if (typeof code !== "string" || !SHORT_CODE_PATTERN.test(code)) {
      response.status(404).json({ error: "Short URL not found" });
      return;
    }

    const shortenedUrl = await this.service.resolveAndRecordVisit(code);
    response.json(serializeShortenedUrl(shortenedUrl, this.publicUrl));
  };
}
