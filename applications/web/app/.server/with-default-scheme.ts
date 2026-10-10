// A scheme followed by a digit is a host with a port ("example.com:8080"), not a scheme.
const HAS_SCHEME = /^[a-z][a-z\d+.-]*:(?!\d)/i;

// Users often type "www.example.com"; assume https only when no scheme was given.
// An explicit scheme is kept as typed, so the domain still rejects anything but http/https.
export function withDefaultScheme(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "" || HAS_SCHEME.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
