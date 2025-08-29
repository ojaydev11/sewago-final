import 'server-only';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json({ success: true, data }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to track progress' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}