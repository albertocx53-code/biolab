/**
 * Server-only configuration. Secrets come from the environment.
 * In development a clearly-marked fallback is allowed so the app runs locally;
 * in production missing secrets are a hard error.
 */
const DEV_FALLBACK = 'biolab-dev-only-secret-do-not-use-in-production-0000';

function read(name: string): string {
  const v = process.env[name];
  if (v && v.length >= 32) return v;
  // Fixed-key mode: derive the server secrets from the two plan keys so the
  // owner only has to set those (changing a key also signs everyone out).
  const b = process.env.BIOLAB_KEY_BASICO?.trim();
  const c = process.env.BIOLAB_KEY_COMPLETO?.trim();
  if (b && c) return `biolab-fixed-v1:${name}:${b}:${c}`;
  if (process.env.NODE_ENV === 'production' && process.env.BIOLAB_ALLOW_DEV_SECRETS !== '1') {
    throw new Error(`${name} ausente ou curto demais (mínimo 32 caracteres).`);
  }
  return `${DEV_FALLBACK}:${name}`;
}

export const authConfig = {
  /**
   * Open access (default): anyone enters without an access key and gets every
   * feature. Set BIOLAB_REQUIRE_KEY=1 to bring back the access keys and plans.
   */
  get openAccess() {
    return process.env.BIOLAB_REQUIRE_KEY !== '1';
  },
  get sessionSecret() {
    return read('BIOLAB_SESSION_SECRET');
  },
  get keyPepper() {
    return read('BIOLAB_KEY_PEPPER');
  },
  sessionCookie: 'biolab_session',
  deviceCookie: 'biolab_device',
  /** Session lifetime: 12 hours (a school day), renewed on activity. */
  sessionTtlSeconds: 60 * 60 * 12,
  deviceTtlSeconds: 60 * 60 * 24 * 365,
  rateLimit: { maxFailures: 5, windowMs: 15 * 60 * 1000 },
};
