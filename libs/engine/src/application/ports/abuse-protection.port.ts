export interface AbuseProtectionPort {
  ensureCanCreate(ipAddress: string): Promise<void>;
}
