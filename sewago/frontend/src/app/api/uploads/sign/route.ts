import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit-adapters';
import { ratePolicies } from '@/lib/rate-policies';
import { getIdentifier } from '@/lib/request-identity';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(getIdentifier(request), ratePolicies.uploads);
    if (!rateLimitResult.success) return NextResponse.json({ error: 'Rate limited' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });

    const body = await request.json();

    return NextResponse.json({ success: true, data: { key: 'signed-url', body } }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to sign upload' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
