/**
 * One-time setup for a Vercel deployment. Run on YOUR computer:
 *
 *   npm run vercel:setup
 *
 * Generates new session secret + key pepper, creates one Complete and one Basic
 * access key hashed with that pepper, and prints:
 *   1) the three environment variables to paste into Vercel (Settings → Environment Variables);
 *   2) the two access keys (shown once).
 * Nothing is written to disk and nothing is sent anywhere.
 */
import { randomBytes } from 'node:crypto';

process.env.BIOLAB_SESSION_SECRET = randomBytes(48).toString('base64url');
process.env.BIOLAB_KEY_PEPPER = randomBytes(48).toString('base64url');

const { setKeyStore } = await import('@/lib/auth/store');
const { createAccessKey } = await import('@/lib/auth/access');


const list: import("@/lib/auth/store").KeyRecord[] = [];
setKeyStore({
  findByHash: async (h) => list.find((k) => k.hash === h) ?? null,
  findById: async (id) => list.find((k) => k.id === id) ?? null,
  list: async () => list,
  insert: async (r) => void list.push(r),
  update: async () => null,
});

const completo = await createAccessKey({ tier: 'completo', label: 'Professor', maxDevices: null });
const basico = await createAccessKey({ tier: 'basico', label: 'Teste Básico', maxDevices: null });
const keysVar = Buffer.from(JSON.stringify({ version: 1, keys: list })).toString('base64');

console.log(`
=== 1) Cole na Vercel: projeto biolab3d → Settings → Environment Variables ===
(marque Production e Preview; depois faça Redeploy)

BIOLAB_SESSION_SECRET=${process.env.BIOLAB_SESSION_SECRET}
BIOLAB_KEY_PEPPER=${process.env.BIOLAB_KEY_PEPPER}
BIOLAB_KEYS=${keysVar}

=== 2) Suas chaves de acesso (aparecem só agora) ===

Plano Completo: ${completo.key}
Plano Básico:   ${basico.key}

Para criar mais chaves depois, use os mesmos BIOLAB_KEY_PEPPER e BIOLAB_SESSION_SECRET
num arquivo .env.local e rode: npm run keys:create e npm run keys:export.
`);
