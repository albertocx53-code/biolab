import { describe, expect, it } from 'vitest';
import { generateAccessKey, hashAccessKey, normalizeAccessKey } from '@/lib/auth/keys';

describe('access keys', () => {
  it('generates keys in the BIO3D-XXXXX-XXXXX-XXXXX-XXXXX format', () => {
    const k = generateAccessKey();
    expect(k).toMatch(/^BIO3D(-[0-9A-HJKMNP-TV-Z]{5}){4}$/);
  });
  it('generates unique keys', () => {
    const set = new Set(Array.from({ length: 2000 }, generateAccessKey));
    expect(set.size).toBe(2000);
  });
  it('normalizes user input (case, spaces, dashes, ambiguous letters)', () => {
    const k = generateAccessKey();
    const messy = ` ${k.toLowerCase().replace(/-/g, ' ')} `;
    expect(normalizeAccessKey(messy)).toBe(normalizeAccessKey(k));
    expect(normalizeAccessKey('BIO3D-OOOOO-IIIII-LLLLL-00000')).toBe('BIO3D00000111111111100000');
  });
  it('rejects malformed keys', () => {
    expect(normalizeAccessKey('')).toBeNull();
    expect(normalizeAccessKey('BIO3D-123')).toBeNull();
    expect(normalizeAccessKey('BIO3D-UUUUU-AAAAA-AAAAA-AAAAA')).toBeNull(); // U not in alphabet
  });
  it('hashes deterministically and depends on the pepper', async () => {
    const n = normalizeAccessKey(generateAccessKey())!;
    const a = await hashAccessKey(n, 'pepper-one-0123456789012345678901234');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashAccessKey(n, 'pepper-one-0123456789012345678901234')).toBe(a);
    expect(await hashAccessKey(n, 'pepper-two-0123456789012345678901234')).not.toBe(a);
  });
});
