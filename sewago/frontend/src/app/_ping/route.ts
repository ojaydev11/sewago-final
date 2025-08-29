import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json({ ok: true, where: 'app/_ping', ts: Date.now() });
}
