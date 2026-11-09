/**
 * Server-only configuration. Secrets come from the environment.
 * In development a clearly-marked fallback is allowed so the app runs locally;
 * in production missing secrets are a hard error.
 */
const DEV_FALLBACK = 'biolab-dev-only-secret-do-not-use-in-production-0000';

function read(name: string): string {
  const v = process.env[name];
  if (v && v.length >= 32) return v;
  if (process.env.NODE_ENV === 'production' && process.env.BIOLAB_ALLOW_DEV_SECRETS !== '1') {
    throw new Error(`${name} ausente ou curto demais (mínimo 32 caracteres).`);
  }
  return `${DEV_FALLBACK}:${name}`;
}

export const authConfig = {
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
