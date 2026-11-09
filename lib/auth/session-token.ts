/**
 * Stateless, HMAC-signed session tokens (Web Crypto; works in Edge middleware).
 * The token only proves *who* the session belongs to. Revocation and expiry of
 * the underlying key are re-checked server-side on every protected page and
 * API request (see lib/auth/session.ts).
 */
import { z } from 'zod';
import { TIERS } from '@/lib/permissions/tiers';
import { fromBase64Url, hmacSha256, hmacVerify, toBase64Url } from './crypto';

export const SessionPayloadSchema = z.object({
  v: z.literal(1),
  sid: z.string().min(8), // session id
  kid: z.string().min(4), // key record id
  tier: z.enum(TIERS),
  iat: z.number().int(),
  exp: z.number().int(),
});
export type SessionPayload = z.infer<typeof SessionPayloadSchema>;

const enc = new TextEncoder();
const dec = new TextDecoder();

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  const body = toBase64Url(enc.encode(JSON.stringify(payload)));
  const sig = toBase64Url(await hmacSha256(secret, `session:v1:${body}`));
  return `${body}.${sig}`;
}

export async function verifySession(token: string | undefined | null, secret: string, nowSec = Math.floor(Date.now() / 1000)): Promise<SessionPayload | null> {
  if (!token || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let ok = false;
  try {
    ok = await hmacVerify(secret, `session:v1:${body}`, fromBase64Url(sig));
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const payload = SessionPayloadSchema.parse(JSON.parse(dec.decode(fromBase64Url(body))));
    if (payload.exp <= nowSec) return null;
    return payload;
  } catch {
    return null;
  }
}
