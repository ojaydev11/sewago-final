import 'server-only';
import { NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'frontend',
    time: new Date().toISOString(),
  });
}