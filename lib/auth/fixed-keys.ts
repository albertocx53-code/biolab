/**
 * Fixed-key mode (owner's choice): one shared key per plan, set in the server
 * environment as BIOLAB_KEY_BASICO and BIOLAB_KEY_COMPLETO. No per-buyer keys,
 * no setup script. The keys never reach the browser; the server compares them
 * and issues a signed session with the matching plan.
 * When these variables are set they take precedence over the key stores.
 */
import type { Tier } from '@/lib/permissions/tiers';
import type { KeyRecord, KeyStore } from './store';

export interface FixedKeys {
  basico: string;
  completo: string;
}

/** Case, spaces and dashes don't matter when typing a fixed key. */
export const simplifyKey = (s: string) => s.toUpperCase().replace(/[\s\-_.]/g, '');

export function fixedKeys(): FixedKeys | null {
  const basico = process.env.BIOLAB_KEY_BASICO?.trim();
  const completo = process.env.BIOLAB_KEY_COMPLETO?.trim();
  if (!basico || !completo) return null;
  return { basico, completo };
}

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function tierForFixedKey(input: string, keys: FixedKeys): Tier | null {
  const s = simplifyKey(input);
  if (!s) return null;
  if (equal(s, simplifyKey(keys.completo))) return 'completo';
  if (equal(s, simplifyKey(keys.basico))) return 'basico';
  return null;
}

export function fixedRecord(tier: Tier): KeyRecord {
  return {
    id: `fixo-${tier}`,
    hash: '0'.repeat(64),
    hint: tier,
    tier,
    label: tier === 'completo' ? 'Chave única do Plano Completo' : 'Chave única do Plano Básico',
    createdAt: '2026-11-09T00:00:00.000Z',
    revokedAt: null,
    expiresAt: null,
    maxDevices: null,
    devices: [],
    orderRef: null,
  };
}

export class FixedKeyStore implements KeyStore {
  async findByHash() {
    return null;
  }
  async findById(id: string) {
    return id === 'fixo-basico' ? fixedRecord('basico') : id === 'fixo-completo' ? fixedRecord('completo') : null;
  }
  async list() {
    return [fixedRecord('basico'), fixedRecord('completo')];
  }
  async insert(): Promise<void> {
    throw new Error('Modo de chaves fixas: troque BIOLAB_KEY_BASICO / BIOLAB_KEY_COMPLETO no servidor.');
  }
  async update(id: string) {
    return this.findById(id);
  }
}
