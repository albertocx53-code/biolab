import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { authConfig } from '@/lib/auth/config';
import { ERROR_MESSAGES, validateAccessKey } from '@/lib/auth/access';
import { FailureLimiter } from '@/lib/auth/rate-limit';
import { issueSessionToken, sessionCookieOptions } from '@/lib/auth/session';
import { randomBytes, toBase64Url } from '@/lib/auth/crypto';

export const runtime = 'nodejs';

const limiter = new FailureLimiter(authConfig.rateLimit.maxFailures, authConfig.rateLimit.windowMs);
const Body = z.object({ key: z.string().min(1).max(64) });

function clientId(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return fwd || req.headers.get('x-real-ip') || 'local';
}

export async function POST(req: NextRequest) {
  const ip = clientId(req);
  const wait = limiter.retryAfter(ip);
  if (wait > 0) {
    return NextResponse.json(
      { ok: false, error: 'limite-tentativas', message: ERROR_MESSAGES['limite-tentativas'], retryAfter: wait },
      { status: 429, headers: { 'Retry-After': String(wait) } },
    );
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    limiter.fail(ip);
    return NextResponse.json({ ok: false, error: 'formato', message: ERROR_MESSAGES.formato }, { status: 400 });
  }

  const existingDevice = req.cookies.get(authConfig.deviceCookie)?.value;
  const deviceId = existingDevice && /^[A-Za-z0-9_-]{16,64}$/.test(existingDevice) ? existingDevice : toBase64Url(randomBytes(18));

  try {
    const result = await validateAccessKey(body.key, deviceId);
    if (!result.ok) {
      limiter.fail(ip);
      const status = result.reason === 'formato' ? 400 : result.reason === 'invalida' ? 401 : 403;
      return NextResponse.json({ ok: false, error: result.reason, message: ERROR_MESSAGES[result.reason] }, { status });
    }
    limiter.reset(ip);
    const { token, maxAge } = await issueSessionToken(result.record.id, result.record.tier);
    const res = NextResponse.json({ ok: true, tier: result.record.tier, redirect: '/explorar' });
    res.cookies.set(authConfig.sessionCookie, token, sessionCookieOptions(maxAge));
    res.cookies.set(authConfig.deviceCookie, deviceId, sessionCookieOptions(authConfig.deviceTtlSeconds));
    return res;
  } catch (e) {
    console.error('[access] validation error', e);
    return NextResponse.json({ ok: false, error: 'erro', message: ERROR_MESSAGES.erro }, { status: 500 });
  }
}
