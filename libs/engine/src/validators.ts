/**
 * Input Validation Module
 * 
 * Provides validation functions for URLs and short codes with security considerations.
 * Prevents common vulnerabilities like open redirects and internal network access.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates and normalizes a URL
 * 
 * Security measures:
 * - Protocol whitelist (HTTP/HTTPS only)
 * - Blocks internal/private IP addresses
 * - Length limitations
 * - Format validation
 * 
 * @param url - The URL string to validate
 * @returns Normalized URL string
 * @throws ValidationError if URL is invalid or poses security risk
 */
export function validateUrl(url: string): string {
  // Trim whitespace
  const trimmed = url.trim();
  
  if (!trimmed) {
    throw new ValidationError('URL cannot be empty');
  }
  
  // Length check (prevent DoS via large inputs)
  if (trimmed.length > 2048) {
    throw new ValidationError('URL is too long (max 2048 characters)');
  }
  
  // Parse and validate URL format
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ValidationError('Invalid URL format. Please enter a valid URL starting with http:// or https://');
  }
  
  // Protocol whitelist - only allow HTTP/HTTPS
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ValidationError('Only HTTP and HTTPS protocols are allowed');
  }
  
  // Security: Block internal/private addresses to prevent SSRF attacks
  const hostname = parsed.hostname.toLowerCase();
  
  // Block localhost variations
  const localhostAddresses = [
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0',
  ];
  
  if (localhostAddresses.includes(hostname)) {
    throw new ValidationError('Cannot shorten internal or private addresses');
  }
  
  // Block private IP ranges (RFC 1918)
  // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  if (
    hostname.match(/^10\./) ||
    hostname.match(/^192\.168\./) ||
    hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
  ) {
    throw new ValidationError('Cannot shorten private network addresses');
  }
  
  // Block link-local addresses (169.254.0.0/16)
  if (hostname.match(/^169\.254\./)) {
    throw new ValidationError('Cannot shorten link-local addresses');
  }
  
  return trimmed;
}

/**
 * Validates a short code format
 * 
 * Ensures short codes meet length and character requirements.
 * Used for custom short code validation if that feature is added.
 * 
 * @param code - The short code to validate
 * @throws ValidationError if code is invalid
 */
export function validateShortCode(code: string): void {
  if (!code || code.length < 6 || code.length > 12) {
    throw new ValidationError('Short code must be 6-12 characters');
  }
  
  // Only allow alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    throw new ValidationError('Short code contains invalid characters');
  }
}
