/**
 * First line of defence: rejects requests without a validly-signed session
 * before they reach protected pages or APIs. Revocation and tier checks happen
 * again server-side (lib/auth/session.ts) on every protected request.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { authConfig } from '@/lib/auth/config';
import { verifySession } from '@/lib/auth/session-token';

const PUBLIC_API = ['/api/access', '/api/access/logout'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (authConfig.openAccess) return NextResponse.next(); // no access keys: everything is open
  const token = req.cookies.get(authConfig.sessionCookie)?.value;
  const session = await verifySession(token, authConfig.sessionSecret);

  if (pathname === '/') {
    if (session && !req.nextUrl.searchParams.has('expirada')) return NextResponse.redirect(new URL('/explorar', req.url));
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/')) {
    if (PUBLIC_API.includes(pathname)) return NextResponse.next();
    if (!session) return NextResponse.json({ ok: false, error: 'nao-autenticado' }, { status: 401 });
    return NextResponse.next();
  }
  if (!session) {
    const url = new URL('/', req.url);
    url.searchParams.set('expirada', '1');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/explorar/:path*', '/studio/:path*', '/api/:path*'],
};
