import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth/config';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(authConfig.sessionCookie, '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res;
}
