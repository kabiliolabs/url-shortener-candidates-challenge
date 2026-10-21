/**
 * SSRF protection: recognises hosts that live inside the network rather than on
 * the public internet.
 *
 * Without this, the service is a confused deputy: anyone can mint a link on our
 * domain that points at `http://169.254.169.254/` (the cloud metadata endpoint,
 * which hands out instance credentials), at an internal admin panel, or at a
 * service only reachable from inside the VPC.
 *
 * Note on what this does NOT cover: a public hostname whose DNS record resolves
 * to a private address (DNS rebinding). Closing that needs resolution at
 * creation time plus a re-check at redirect time, and is listed as pending work
 * in CHALLENGE_SUBMISSION.md.
 */
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
]);

const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa"];

export function isInternalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  // URL.hostname keeps the brackets around IPv6 literals.
  const bare = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;

  if (BLOCKED_HOSTNAMES.has(bare)) return true;
  if (BLOCKED_SUFFIXES.some((suffix) => bare.endsWith(suffix))) return true;

  const ipv4 = parseIPv4(bare);
  if (ipv4) return isPrivateIPv4(ipv4);

  if (bare.includes(":")) return isPrivateIPv6(bare);

  return false;
}

/**
 * Only dotted-quad needs handling: the WHATWG URL parser already normalises the
 * decimal, octal and hex forms (`http://2130706433` becomes `127.0.0.1`), so
 * those obfuscations cannot slip past.
 */
function parseIPv4(host: string): number[] | null {
  const parts = host.split(".");
  if (parts.length !== 4) return null;

  const octets = parts.map((part) => (/^\d{1,3}$/.test(part) ? Number(part) : NaN));
  if (octets.some((octet) => Number.isNaN(octet) || octet > 255)) return null;

  return octets;
}

function isPrivateIPv4([a, b]: number[]): boolean {
  const first = a!;
  const second = b!;

  if (first === 0) return true; // 0.0.0.0/8 "this network"
  if (first === 10) return true; // private
  if (first === 127) return true; // loopback
  if (first === 169 && second === 254) return true; // link-local, incl. cloud metadata
  if (first === 172 && second >= 16 && second <= 31) return true; // private
  if (first === 192 && second === 168) return true; // private
  if (first === 192 && second === 0) return true; // IETF protocol assignments
  if (first === 100 && second >= 64 && second <= 127) return true; // CGNAT
  if (first === 198 && (second === 18 || second === 19)) return true; // benchmarking
  if (first >= 224) return true; // multicast + reserved

  return false;
}

function isPrivateIPv6(host: string): boolean {
  const address = host.split("%")[0]!; // drop any zone index

  if (address === "::1" || address === "::") return true;

  // IPv4-mapped (::ffff:127.0.0.1) must be judged by its IPv4 part.
  const mapped = address.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mapped) {
    const ipv4 = parseIPv4(mapped[1]!);
    return ipv4 ? isPrivateIPv4(ipv4) : true;
  }

  const prefix = address.slice(0, 4);
  if (/^f[cd]/i.test(address)) return true; // fc00::/7 unique local
  if (/^fe[89ab]/i.test(prefix)) return true; // fe80::/10 link-local

  return false;
}
