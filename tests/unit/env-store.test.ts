import { afterAll, describe, expect, it } from 'vitest';
import { createAccessKey, validateAccessKey } from '@/lib/auth/access';
import { EnvKeyStore, setKeyStore, type KeyRecord } from '@/lib/auth/store';

afterAll(() => setKeyStore(null));

describe('EnvKeyStore (Vercel)', () => {
  it('validates keys exported as base64 and stays read-only', async () => {
    // Create a key in a throwaway in-memory store, then load it the way Vercel does.
    const mem: KeyRecord[] = [];
    setKeyStore({
      findByHash: async (h) => mem.find((k) => k.hash === h) ?? null,
      findById: async (id) => mem.find((k) => k.id === id) ?? null,
      list: async () => mem,
      insert: async (r) => void mem.push(r),
      update: async () => null,
    });
    const { key } = await createAccessKey({ tier: 'basico', maxDevices: null });
    const encoded = Buffer.from(JSON.stringify({ version: 1, keys: mem })).toString('base64');

    const store = new EnvKeyStore(encoded);
    setKeyStore(store);
    const ok = await validateAccessKey(key, 'device-a');
    expect(ok.ok && ok.record.tier).toBe('basico');
    expect((await validateAccessKey('BIO3D-00000-00000-00000-00000', 'device-a')).ok).toBe(false);
    await expect(store.insert()).rejects.toThrow(/somente leitura/);
  });
});
