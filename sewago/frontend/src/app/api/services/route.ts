import 'server-only';
import { NextResponse } from 'next/server';
import { getServices } from '@/lib/services';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json({ success: true, data: services }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch services' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}