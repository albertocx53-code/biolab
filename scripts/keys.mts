/**
 * Administrative CLI for access keys (run on the server; never shipped to clients).
 *
 *   npm run keys:create -- --tier basico|completo [--label "Escola X"] [--max-devices 3|0] [--expires 2027-12-31]
 *   npm run keys:list
 *   npm run keys:revoke -- <key_id>
 *
 * --max-devices 0 means unlimited. The plaintext key is printed ONCE.
 */
import { createAccessKey, revokeAccessKey } from '@/lib/auth/access';
import { getKeyStore } from '@/lib/auth/store';
import { isTier } from '@/lib/permissions/tiers';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const cmd = process.argv[2];
if (cmd === 'create') {
  const tier = arg('tier') ?? 'basico';
  if (!isTier(tier)) throw new Error('--tier deve ser "basico" ou "completo"');
  const md = arg('max-devices');
  const expires = arg('expires');
  const { key, record } = await createAccessKey({
    tier,
    label: arg('label') ?? '',
    maxDevices: md === undefined ? 3 : Number(md) === 0 ? null : Number(md),
    expiresAt: expires ? new Date(expires).toISOString() : null,
  });
  if (process.argv.includes('--json')) console.log(JSON.stringify({ id: record.id, key, tier: record.tier }));
  else console.log(`\nChave criada (${record.tier}) — id ${record.id}\n\n  ${key}\n\nGuarde agora: ela não poderá ser exibida novamente.\n`);
} else if (cmd === 'list') {
  const keys = await getKeyStore().list();
  console.table(keys.map((k) => ({ id: k.id, plano: k.tier, final: k.hint, rotulo: k.label, dispositivos: `${k.devices.length}/${k.maxDevices ?? '∞'}`, revogada: k.revokedAt ?? '', expira: k.expiresAt ?? '' })));
} else if (cmd === 'revoke') {
  const id = process.argv[3];
  const r = id ? await revokeAccessKey(id) : null;
  console.log(r ? `Chave ${r.id} revogada em ${r.revokedAt}` : 'Chave não encontrada');
} else {
  console.log('Uso: keys.ts create|list|revoke');
}
