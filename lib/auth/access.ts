/**
 * Access-key service: validation, activation policy and administration.
 * Server-only.
 */
import 'server-only';
import { authConfig } from './config';
import { generateAccessKey, hashAccessKey, keyHint, normalizeAccessKey } from './keys';
import { getKeyStore, type KeyRecord } from './store';
import { fixedKeys, fixedRecord, tierForFixedKey } from './fixed-keys';
import { randomBytes, toHex, hmacSha256 } from './crypto';
import type { Tier } from '@/lib/permissions/tiers';

export type ValidationResult =
  | { ok: true; record: KeyRecord }
  | { ok: false; reason: 'formato' | 'invalida' | 'revogada' | 'expirada' | 'limite-dispositivos' };

export async function hashDeviceId(deviceId: string): Promise<string> {
  return toHex(await hmacSha256(authConfig.keyPepper, `device:v1:${deviceId}`)).slice(0, 32);
}

export function isRecordActive(r: KeyRecord, now = new Date()): boolean {
  if (r.revokedAt) return false;
  if (r.expiresAt && new Date(r.expiresAt) <= now) return false;
  return true;
}

export async function validateAccessKey(input: string, deviceId: string, now = new Date()): Promise<ValidationResult> {
  const fixed = fixedKeys();
  if (fixed) {
    const tier = tierForFixedKey(input, fixed);
    return tier ? { ok: true, record: fixedRecord(tier) } : { ok: false, reason: 'invalida' };
  }
  const normalized = normalizeAccessKey(input);
  if (!normalized) return { ok: false, reason: 'formato' };
  const store = getKeyStore();
  const hash = await hashAccessKey(normalized, authConfig.keyPepper);
  const record = await store.findByHash(hash);
  if (!record) return { ok: false, reason: 'invalida' };
  if (record.revokedAt) return { ok: false, reason: 'revogada' };
  if (record.expiresAt && new Date(record.expiresAt) <= now) return { ok: false, reason: 'expirada' };

  const dev = await hashDeviceId(deviceId);
  const known = record.devices.some((d) => d.id === dev);
  if (!known && record.maxDevices !== null && record.devices.length >= record.maxDevices) {
    return { ok: false, reason: 'limite-dispositivos' };
  }
  const iso = now.toISOString();
  const updated = await store.update(record.id, (r) => ({
    ...r,
    devices: known
      ? r.devices.map((d) => (d.id === dev ? { ...d, lastSeen: iso } : d))
      : [...r.devices, { id: dev, firstSeen: iso, lastSeen: iso }],
  }));
  return { ok: true, record: updated ?? record };
}

export interface CreateKeyOptions {
  tier: Tier;
  label?: string;
  maxDevices?: number | null;
  expiresAt?: string | null;
  orderRef?: string | null;
}

/** Creates a key and returns the plaintext ONCE. Only the hash is stored. */
export async function createAccessKey(opts: CreateKeyOptions): Promise<{ key: string; record: KeyRecord }> {
  const key = generateAccessKey();
  const normalized = normalizeAccessKey(key)!;
  const record: KeyRecord = {
    id: `key_${toHex(randomBytes(8))}`,
    hash: await hashAccessKey(normalized, authConfig.keyPepper),
    hint: keyHint(normalized),
    tier: opts.tier,
    label: opts.label ?? '',
    createdAt: new Date().toISOString(),
    revokedAt: null,
    expiresAt: opts.expiresAt ?? null,
    maxDevices: opts.maxDevices === undefined ? 3 : opts.maxDevices,
    devices: [],
    orderRef: opts.orderRef ?? null,
  };
  await getKeyStore().insert(record);
  return { key, record };
}

export async function revokeAccessKey(id: string): Promise<KeyRecord | null> {
  return getKeyStore().update(id, (r) => ({ ...r, revokedAt: r.revokedAt ?? new Date().toISOString() }));
}

export const ERROR_MESSAGES: Record<Exclude<ValidationResult, { ok: true }>['reason'] | 'limite-tentativas' | 'erro', string> = {
  formato: 'O formato da chave não é válido. Ela tem o formato BIO3D-XXXXX-XXXXX-XXXXX-XXXXX.',
  invalida: 'Não encontramos essa chave. Confira se ela foi digitada corretamente.',
  revogada: 'Esta chave foi desativada. Se você acredita que é um engano, fale com o suporte.',
  expirada: 'Esta chave expirou. Fale com o suporte para renovar seu acesso.',
  'limite-dispositivos': 'Esta chave já foi ativada no número máximo de dispositivos permitido. Fale com o suporte para liberar um novo dispositivo.',
  'limite-tentativas': 'Muitas tentativas sem sucesso. Aguarde alguns minutos e tente novamente.',
  erro: 'Não foi possível validar a chave agora. Tente novamente em instantes.',
};
