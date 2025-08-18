import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

