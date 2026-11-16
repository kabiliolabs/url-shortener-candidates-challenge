import { InvalidUrlError } from "./errors";

export interface ShortUrlProps {
  code: string;
  originalUrl: string;
  createdAt?: Date;
  clickCount?: number;
}

export class ShortUrl {
  readonly code: string;
  readonly originalUrl: string;
  readonly createdAt: Date;
  clickCount: number;

  constructor(props: ShortUrlProps) {
    if (!props.originalUrl) {
      throw new InvalidUrlError();
    }

    this.code = props.code;
    this.originalUrl = props.originalUrl;
    this.createdAt = props.createdAt ?? new Date();
    this.clickCount = props.clickCount ?? 0;
  }

  recordClick(): void {
    this.clickCount += 1;
  }
}
