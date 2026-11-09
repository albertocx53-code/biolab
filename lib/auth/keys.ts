/**
 * Access-key format, generation and hashing.
 *
 * Format: BIO3D-XXXXX-XXXXX-XXXXX-XXXXX (Crockford base32, 100 bits of entropy).
 * Only an HMAC-SHA256 (keyed with a server-side pepper) of the normalized key is
 * stored. Because keys are high-entropy random values, a keyed fast hash is
 * appropriate and allows O(1) lookup; the pepper means a leaked database alone
 * cannot be used to test guesses offline.
 */
import { hmacSha256, randomBytes, toHex } from './crypto';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32 (no I, L, O, U)
export const KEY_PREFIX = 'BIO3D';
const GROUPS = 4;
const GROUP_LEN = 5;

export function generateAccessKey(): string {
  const chars = GROUPS * GROUP_LEN; // 20 chars * 5 bits = 100 bits
  const bytes = randomBytes(chars);
  let out = '';
  for (let i = 0; i < chars; i++) out += ALPHABET[bytes[i] & 31];
  const groups = out.match(new RegExp(`.{${GROUP_LEN}}`, 'g'))!;
  return [KEY_PREFIX, ...groups].join('-');
}

/** Normalizes user input: uppercase, strips spaces/dashes, maps ambiguous chars. */
export function normalizeAccessKey(input: string): string | null {
  let s = input.toUpperCase().replace(/[\s\-_.]/g, '');
  if (s.startsWith(KEY_PREFIX)) s = s.slice(KEY_PREFIX.length);
  s = s.replace(/O/g, '0').replace(/[IL]/g, '1');
  if (s.length !== GROUPS * GROUP_LEN) return null;
  for (const c of s) if (!ALPHABET.includes(c)) return null;
  return `${KEY_PREFIX}${s}`;
}

export async function hashAccessKey(normalized: string, pepper: string): Promise<string> {
  return toHex(await hmacSha256(pepper, `access-key:v1:${normalized}`));
}

/** Short, non-secret hint shown in admin listings (last 4 characters). */
export function keyHint(normalized: string): string {
  return `…${normalized.slice(-4)}`;
}
