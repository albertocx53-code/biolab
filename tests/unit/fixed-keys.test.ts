import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { validateAccessKey } from '@/lib/auth/access';
import { authConfig } from '@/lib/auth/config';
import { getKeyStore, setKeyStore } from '@/lib/auth/store';

describe('fixed keys (one shared key per plan)', () => {
  beforeEach(() => {
    process.env.BIOLAB_KEY_BASICO = 'Prof-Basico-1234';
    process.env.BIOLAB_KEY_COMPLETO = 'Prof-Completo-5678';
    setKeyStore(null);
  });
  afterEach(() => {
    delete process.env.BIOLAB_KEY_BASICO;
    delete process.env.BIOLAB_KEY_COMPLETO;
    setKeyStore(null);
  });

  it('maps each key to its plan, ignoring case, spaces and dashes', async () => {
    const b = await validateAccessKey('prof basico 1234', 'd');
    const c = await validateAccessKey('PROF-COMPLETO-5678', 'd');
    expect(b.ok && b.record.tier).toBe('basico');
    expect(c.ok && c.record.tier).toBe('completo');
    expect((await validateAccessKey('Prof-Completo-0000', 'd')).ok).toBe(false);
    expect((await validateAccessKey('', 'd')).ok).toBe(false);
  });

  it('sessions resolve back to the plan and secrets work without extra setup', async () => {
    expect(await getKeyStore().findById('fixo-completo')).toMatchObject({ tier: 'completo' });
    expect(authConfig.sessionSecret.length).toBeGreaterThanOrEqual(32);
    expect(authConfig.sessionSecret).not.toBe(authConfig.keyPepper);
  });
});
