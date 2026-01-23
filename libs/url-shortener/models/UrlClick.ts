export interface UrlClickProps {
  id?: number;
  shortUrlId: number;
  createdAt?: Date;
  ipHash?: string | null;
  userAgentHash?: string | null;
}

/**
 * Represents a click on a shortened URL
 */
export class UrlClick {
  readonly id?: number;
  readonly shortUrlId: number;
  readonly createdAt: Date;
  readonly ipHash?: string | null;
  readonly userAgentHash?: string | null;

  constructor(props: UrlClickProps) {
    this.id = props.id;
    this.shortUrlId = props.shortUrlId;
    this.createdAt = props.createdAt ?? new Date();
    this.ipHash = props.ipHash;
    this.userAgentHash = props.userAgentHash;
  }
}
