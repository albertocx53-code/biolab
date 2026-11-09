import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createAccessKey, revokeAccessKey, validateAccessKey } from '@/lib/auth/access';
import { FileKeyStore, getKeyStore, setKeyStore } from '@/lib/auth/store';

let dir: string;
beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'biolab-keys-'));
  setKeyStore(new FileKeyStore(path.join(dir, 'keys.json')));
});
afterAll(() => {
  setKeyStore(null);
  rmSync(dir, { recursive: true, force: true });
});

describe('access-key validation', () => {
  it('accepts a valid key and returns its tier; never stores the plaintext', async () => {
    const { key, record } = await createAccessKey({ tier: 'completo' });
    const r = await validateAccessKey(key, 'device-aaaaaaaaaaaaaaaa');
    expect(r.ok && r.record.tier).toBe('completo');
    const stored = JSON.stringify(await getKeyStore().list());
    expect(stored).not.toContain(key);
    expect(stored).not.toContain(key.replace(/-/g, ''));
    expect(record.hash).toMatch(/^[0-9a-f]{64}$/);
  });
  it('rejects unknown and malformed keys', async () => {
    expect(await validateAccessKey('BIO3D-AAAAA-AAAAA-AAAAA-AAAAA', 'd1-aaaaaaaaaaaaaaaa')).toEqual({ ok: false, reason: 'invalida' });
    expect(await validateAccessKey('hello', 'd1-aaaaaaaaaaaaaaaa')).toEqual({ ok: false, reason: 'formato' });
  });
  it('rejects revoked keys', async () => {
    const { key, record } = await createAccessKey({ tier: 'basico' });
    await revokeAccessKey(record.id);
    expect(await validateAccessKey(key, 'd1-aaaaaaaaaaaaaaaa')).toEqual({ ok: false, reason: 'revogada' });
  });
  it('rejects expired keys', async () => {
    const { key } = await createAccessKey({ tier: 'basico', expiresAt: new Date(Date.now() - 1000).toISOString() });
    expect(await validateAccessKey(key, 'd1-aaaaaaaaaaaaaaaa')).toEqual({ ok: false, reason: 'expirada' });
  });
  it('enforces the device activation policy but lets known devices back in', async () => {
    const { key } = await createAccessKey({ tier: 'basico', maxDevices: 2 });
    expect((await validateAccessKey(key, 'dev-1-aaaaaaaaaaaaaaaa')).ok).toBe(true);
    expect((await validateAccessKey(key, 'dev-2-aaaaaaaaaaaaaaaa')).ok).toBe(true);
    expect(await validateAccessKey(key, 'dev-3-aaaaaaaaaaaaaaaa')).toEqual({ ok: false, reason: 'limite-dispositivos' });
    expect((await validateAccessKey(key, 'dev-1-aaaaaaaaaaaaaaaa')).ok).toBe(true);
  });
});
