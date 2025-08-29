<<<<<<< HEAD
=======
import 'server-only';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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