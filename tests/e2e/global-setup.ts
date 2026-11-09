import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { E2E_ENV } from '../../playwright.config';

/** Creates fresh test keys in an isolated store through the admin CLI (same pepper as the server). */
export default async function globalSetup() {
  rmSync(E2E_ENV.BIOLAB_KEYSTORE_PATH, { force: true });
  const env = { ...process.env, ...E2E_ENV };
  const cli = (...args: string[]) =>
    execFileSync('npx', ['tsx', '--conditions=react-server', 'scripts/keys.mts', ...args], { env, encoding: 'utf8' }).trim().split('\n').pop()!;
  const make = (tier: string, ...extra: string[]) => JSON.parse(cli('create', '--tier', tier, '--label', 'e2e', '--json', ...extra));
  const basico = make('basico', '--max-devices', '0');
  const completo = make('completo', '--max-devices', '0');
  const revogada = make('completo');
  cli('revoke', revogada.id);
  mkdirSync('.data', { recursive: true });
  writeFileSync(path.join('.data', 'e2e-test-keys.json'), JSON.stringify({ basico: basico.key, completo: completo.key, revogada: revogada.key }));
}
