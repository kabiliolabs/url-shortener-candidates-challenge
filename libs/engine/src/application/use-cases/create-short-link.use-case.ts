import { OriginalUrl } from "../../domain/value-objects/original-url.vo";
import { ConflictError, ValidationError } from "../../shared/errors";
import type { AbuseProtectionPort } from "../ports/abuse-protection.port";
import type { IdGeneratorPort } from "../ports/id-generator.port";
import type { ShortLinkRepositoryPort } from "../ports/short-link-repository.port";
import { z } from "zod";

export interface CreateShortLinkInput {
  originalUrl: string;
  ipAddress: string;
}

export interface CreateShortLinkResult {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

const MAX_GENERATION_ATTEMPTS = 8;
const SHORT_CODE_LENGTH = 7;

const createShortLinkInputSchema = z.object({
  originalUrl: z.string().trim().min(1, "URL is required."),
  ipAddress: z.string().trim().min(1).optional(),
});

export class CreateShortLinkUseCase {
  constructor(
    private readonly repository: ShortLinkRepositoryPort,
    private readonly idGenerator: IdGeneratorPort,
    private readonly abuseProtection: AbuseProtectionPort,
    private readonly baseUrl: string,
  ) {}

  async execute(input: CreateShortLinkInput): Promise<CreateShortLinkResult> {
    const parsed = createShortLinkInputSchema.safeParse(input);

    if (!parsed.success) {
      const issueMessage = parsed.error.issues[0]?.message ?? "Invalid request.";
      throw new ValidationError(issueMessage);
    }

    const ipAddress = parsed.data.ipAddress ?? "anonymous";

    await this.abuseProtection.ensureCanCreate(ipAddress);

    const originalUrl = OriginalUrl.create(parsed.data.originalUrl).value;

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const shortCode = this.idGenerator.generate(SHORT_CODE_LENGTH);
      const alreadyExists = await this.repository.existsByCode(shortCode);

      if (alreadyExists) {
        continue;
      }

      const created = await this.repository.create({
        code: shortCode,
        originalUrl,
      });

      return {
        shortCode: created.code,
        shortUrl: `${this.baseUrl}/s/${created.code}`,
        originalUrl: created.originalUrl,
      };
    }

    throw new ConflictError(
      "Could not generate a unique short code. Please try again.",
    );
  }
}
