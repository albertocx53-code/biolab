import { afterEach, describe, expect, it } from 'vitest';
import { authConfig } from '@/lib/auth/config';

describe('acesso livre', () => {
  const saved = process.env.BIOLAB_REQUIRE_KEY;
  afterEach(() => {
    if (saved === undefined) delete process.env.BIOLAB_REQUIRE_KEY;
    else process.env.BIOLAB_REQUIRE_KEY = saved;
  });

  it('é o padrão: entra sem chave de acesso', () => {
    delete process.env.BIOLAB_REQUIRE_KEY;
    expect(authConfig.openAccess).toBe(true);
  });

  it('BIOLAB_REQUIRE_KEY=1 volta a exigir a chave', () => {
    process.env.BIOLAB_REQUIRE_KEY = '1';
    expect(authConfig.openAccess).toBe(false);
  });
});
