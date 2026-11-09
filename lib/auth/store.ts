/**
 * Access-key persistence.
 *
 * `KeyStore` is the boundary the rest of the app depends on. This release ships
 * a file-backed implementation (single server / local development). For a
 * multi-instance deployment (e.g. Vercel) implement the same interface on
 * PostgreSQL/Supabase — the schema is in docs/db/001_access_keys.sql.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { TIERS } from '@/lib/permissions/tiers';
import { FixedKeyStore, fixedKeys } from './fixed-keys';

export const DeviceSchema = z.object({
  id: z.string(), // hashed device identifier
  firstSeen: z.string(),
  lastSeen: z.string(),
});

export const KeyRecordSchema = z.object({
  id: z.string(),
  hash: z.string().regex(/^[0-9a-f]{64}$/),
  hint: z.string(),
  tier: z.enum(TIERS),
  label: z.string().default(''),
  createdAt: z.string(),
  revokedAt: z.string().nullable().default(null),
  expiresAt: z.string().nullable().default(null),
  /** Activation policy: maximum distinct devices (null = unlimited). */
  maxDevices: z.number().int().positive().nullable().default(3),
  devices: z.array(DeviceSchema).default([]),
  /** Reserved for checkout integration (order id from the payment provider). */
  orderRef: z.string().nullable().default(null),
});
export type KeyRecord = z.infer<typeof KeyRecordSchema>;

export interface KeyStore {
  findByHash(hash: string): Promise<KeyRecord | null>;
  findById(id: string): Promise<KeyRecord | null>;
  list(): Promise<KeyRecord[]>;
  insert(record: KeyRecord): Promise<void>;
  update(id: string, patch: (r: KeyRecord) => KeyRecord): Promise<KeyRecord | null>;
}

const FileSchema = z.object({ version: z.literal(1), keys: z.array(KeyRecordSchema) });

export class FileKeyStore implements KeyStore {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly file: string) {}

  private async readAll(): Promise<KeyRecord[]> {
    try {
      const raw = await fs.readFile(this.file, 'utf8');
      return FileSchema.parse(JSON.parse(raw)).keys;
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
  }

  private async writeAll(keys: KeyRecord[]): Promise<void> {
    await fs.mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
    const tmp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify({ version: 1, keys }, null, 2), { mode: 0o600 });
    await fs.rename(tmp, this.file);
  }

  /** Serializes read-modify-write cycles within this process. */
  private exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.catch(() => undefined);
    return run;
  }

  async findByHash(hash: string) {
    return (await this.readAll()).find((k) => k.hash === hash) ?? null;
  }
  async findById(id: string) {
    return (await this.readAll()).find((k) => k.id === id) ?? null;
  }
  async list() {
    return this.readAll();
  }
  insert(record: KeyRecord) {
    return this.exclusive(async () => {
      const all = await this.readAll();
      if (all.some((k) => k.hash === record.hash || k.id === record.id)) throw new Error('Chave duplicada');
      all.push(KeyRecordSchema.parse(record));
      await this.writeAll(all);
    });
  }
  update(id: string, patch: (r: KeyRecord) => KeyRecord) {
    return this.exclusive(async () => {
      const all = await this.readAll();
      const i = all.findIndex((k) => k.id === id);
      if (i < 0) return null;
      all[i] = KeyRecordSchema.parse(patch(all[i]));
      await this.writeAll(all);
      return all[i];
    });
  }
}

/**
 * Read-only store loaded from the BIOLAB_KEYS environment variable (base64 of the
 * same JSON as the file store, produced by `npm run keys:export`). Used on
 * serverless hosts such as Vercel, where the filesystem is not persistent.
 * Limitations: new keys and revocations need an env update + redeploy, and
 * device registrations live only in the memory of each server instance, so the
 * device limit is not enforced. A database store replaces this (ACCESS_KEYS.md).
 */
export class EnvKeyStore implements KeyStore {
  private readonly keys: KeyRecord[];
  constructor(encoded: string) {
    const json = encoded.trim().startsWith('{') ? encoded : Buffer.from(encoded, 'base64').toString('utf8');
    this.keys = FileSchema.parse(JSON.parse(json)).keys;
  }
  async findByHash(hash: string) {
    return this.keys.find((k) => k.hash === hash) ?? null;
  }
  async findById(id: string) {
    return this.keys.find((k) => k.id === id) ?? null;
  }
  async list() {
    return [...this.keys];
  }
  async insert(): Promise<void> {
    throw new Error('BIOLAB_KEYS é somente leitura: crie a chave com o CLI e atualize a variável (npm run keys:export).');
  }
  async update(id: string, patch: (r: KeyRecord) => KeyRecord) {
    const i = this.keys.findIndex((k) => k.id === id);
    if (i < 0) return null;
    this.keys[i] = KeyRecordSchema.parse(patch(this.keys[i]));
    return this.keys[i];
  }
}

let singleton: KeyStore | null = null;
export function getKeyStore(): KeyStore {
  if (!singleton && fixedKeys()) singleton = new FixedKeyStore();
  if (!singleton && process.env.BIOLAB_KEYS) singleton = new EnvKeyStore(process.env.BIOLAB_KEYS);
  if (!singleton) {
    const file = process.env.BIOLAB_KEYSTORE_PATH || path.join(process.cwd(), '.data', 'keys.json');
    singleton = new FileKeyStore(path.resolve(file));
  }
  return singleton;
}
/** Test hook. */
export function setKeyStore(store: KeyStore | null) {
  singleton = store;
}
