import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { CAPABILITIES, can } from '@/lib/permissions/tiers';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    tier: s.tier,
    capabilities: CAPABILITIES.filter((c) => can(s.tier, c)),
    expiresAt: s.expiresAt,
  });
}
