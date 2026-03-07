import { ShortCode } from '../value-objects/ShortCode';
import { OriginalUrl } from '../value-objects/OriginalUrl';

export interface UrlProps {
  id?: string;
  originalUrl: OriginalUrl;
  shortCode: ShortCode;
  clicks?: number;
  createdAt?: Date;
}

export class Url {
  public id?: string;
  public originalUrl: OriginalUrl;
  public shortCode: ShortCode;
  public clicks: number;
  public createdAt: Date;

  private constructor(props: UrlProps) {
    this.id = props.id;
    this.originalUrl = props.originalUrl;
    this.shortCode = props.shortCode;
    this.clicks = props.clicks ?? 0;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static create(props: UrlProps): Url {
    return new Url(props);
  }

  public incrementClicks(): void {
    this.clicks += 1;
  }
}
