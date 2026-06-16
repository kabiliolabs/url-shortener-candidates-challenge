import { OriginalUrl } from "../value-objects/original-url";
import { ShortCode } from "../value-objects/short-code";

export interface ShortUrlProps {
  id: string;
  shortCode: ShortCode;
  originalUrl: OriginalUrl;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastClickedAt: Date | null;
}

export class ShortUrl {
  constructor(private readonly props: ShortUrlProps) {}

  get id(): string {
    return this.props.id;
  }

  get shortCode(): ShortCode {
    return this.props.shortCode;
  }

  get originalUrl(): OriginalUrl {
    return this.props.originalUrl;
  }

  get clickCount(): number {
    return this.props.clickCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get lastClickedAt(): Date | null {
    return this.props.lastClickedAt;
  }
}
