import { describe, expect, it } from 'vitest';
import { signSession, verifySession, type SessionPayload } from '@/lib/auth/session-token';
import { FailureLimiter } from '@/lib/auth/rate-limit';
import { can } from '@/lib/permissions/tiers';

const SECRET = 'test-secret-0123456789-0123456789-0123456789';
const now = Math.floor(Date.now() / 1000);
const payload: SessionPayload = { v: 1, sid: 'abcdefghijkl', kid: 'key_1234', tier: 'basico', iat: now, exp: now + 60 };

describe('session tokens', () => {
  it('round-trips a valid token', async () => {
    const t = await signSession(payload, SECRET);
    expect(await verifySession(t, SECRET)).toEqual(payload);
  });
  it('rejects a token signed with another secret', async () => {
    const t = await signSession(payload, SECRET);
    expect(await verifySession(t, SECRET + 'x')).toBeNull();
  });
  it('rejects a tampered payload (tier escalation)', async () => {
    const t = await signSession(payload, SECRET);
    const [, sig] = t.split('.');
    const forged = Buffer.from(JSON.stringify({ ...payload, tier: 'completo' })).toString('base64url');
    expect(await verifySession(`${forged}.${sig}`, SECRET)).toBeNull();
  });
  it('rejects expired tokens and garbage', async () => {
    const t = await signSession({ ...payload, exp: now - 1 }, SECRET);
    expect(await verifySession(t, SECRET)).toBeNull();
    expect(await verifySession('abc', SECRET)).toBeNull();
    expect(await verifySession(undefined, SECRET)).toBeNull();
  });
});

describe('failure limiter', () => {
  it('blocks after N failures within the window and recovers afterwards', () => {
    let t = 0;
    const l = new FailureLimiter(3, 1000, () => t);
    for (let i = 0; i < 3; i++) l.fail('ip');
    expect(l.retryAfter('ip')).toBeGreaterThan(0);
    expect(l.retryAfter('other')).toBe(0);
    t = 1001;
    expect(l.retryAfter('ip')).toBe(0);
  });
});

describe('permissions', () => {
  it('Basic grants the labs and presentation, not Studio', () => {
    expect(can('basico', 'explorer.labs')).toBe(true);
    expect(can('basico', 'explorer.presentation')).toBe(true);
    expect(can('basico', 'studio.access')).toBe(false);
    expect(can('basico', 'studio.generators')).toBe(false);
  });
  it('Complete grants everything; no tier grants nothing', () => {
    expect(can('completo', 'studio.access')).toBe(true);
    expect(can('completo', 'explorer.labs')).toBe(true);
    expect(can(null, 'explorer.labs')).toBe(false);
  });
});
