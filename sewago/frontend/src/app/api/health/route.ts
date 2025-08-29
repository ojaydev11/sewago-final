import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ 
    ok: true, 
    ts: Date.now(),
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
}
