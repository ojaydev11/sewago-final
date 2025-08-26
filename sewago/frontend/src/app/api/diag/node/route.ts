import 'server-only';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function GET() {
  // Check if we're in Node.js environment
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  const guardOk = isNode;
  
  return NextResponse.json({ runtime: 'nodejs', guardOk });
}
