/**
 * Server-side session helpers for server components and route handlers.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authConfig } from './config';
import { signSession, verifySession, type SessionPayload } from './session-token';
import { getKeyStore } from './store';
import { isRecordActive } from './access';
import { randomBytes, toBase64Url } from './crypto';
import { can, type Capability, type Tier } from '@/lib/permissions/tiers';

export interface Session {
  sessionId: string;
  keyId: string;
  tier: Tier;
  expiresAt: number;
  /** Open access (no access key): every feature is available. */
  open?: boolean;
}

const OPEN_SESSION: Session = { sessionId: 'acesso-livre', keyId: 'acesso-livre', tier: 'completo', expiresAt: Number.MAX_SAFE_INTEGER, open: true };

export async function issueSessionToken(keyId: string, tier: Tier): Promise<{ token: string; maxAge: number }> {
  const iat = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { v: 1, sid: toBase64Url(randomBytes(12)), kid: keyId, tier, iat, exp: iat + authConfig.sessionTtlSeconds };
  return { token: await signSession(payload, authConfig.sessionSecret), maxAge: authConfig.sessionTtlSeconds };
}

export const sessionCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
});

/**
 * Full check: signature + expiry + the key is still active (not revoked/expired).
 * The tier is read from the key record, so a tier change takes effect immediately.
 */
export async function getSession(): Promise<Session | null> {
  if (authConfig.openAccess) return OPEN_SESSION;
  const jar = await cookies();
  const payload = await verifySession(jar.get(authConfig.sessionCookie)?.value, authConfig.sessionSecret);
  if (!payload) return null;
  const record = await getKeyStore().findById(payload.kid);
  if (!record || !isRecordActive(record)) return null;
  return { sessionId: payload.sid, keyId: record.id, tier: record.tier, expiresAt: payload.exp };
}

export async function requireSession(capability: Capability = 'explorer.labs'): Promise<Session> {
  const s = await getSession();
  if (!s) redirect('/?expirada=1');
  if (!can(s.tier, capability)) redirect('/explorar?sem-permissao=1');
  return s;
}
