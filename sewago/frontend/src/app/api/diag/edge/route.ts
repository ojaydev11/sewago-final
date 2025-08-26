import 'server-only';
export const runtime = 'edge';
import { NextResponse } from 'next/server';

export const GET = async () => {
  // Guard is not injected on Edge; accessing global DOM here should NOT throw
  const edgeOk = typeof globalThis.document === 'undefined'; // should be undefined on Edge, and no guard trap
  return NextResponse.json({ runtime: 'edge', edgeOk });
};
