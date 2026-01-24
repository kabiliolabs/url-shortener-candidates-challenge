import { ShortenedUrlProps } from "./types";
// Represents a shortened URL
export class ShortenedUrl {
  readonly id?: number;
  readonly shortCode: string;
  readonly originalUrl: string;
  readonly createdAt: Date;
  readonly createdByIpHash?: string | null;
  readonly createdByUserAgentHash?: string | null;
  //Internal field for clicks count
  private _clicks: number;

  constructor(props: ShortenedUrlProps) {
    this.id = props.id;
    this.shortCode = props.shortCode;
    this.originalUrl = props.originalUrl;
    this.createdAt = props.createdAt ?? new Date();
    this.createdByIpHash = props.createdByIpHash;
    this.createdByUserAgentHash = props.createdByUserAgentHash;
    this._clicks = props.clicks ?? 0;
  }

  get clicks(): number {
    return this._clicks;
  }

}
