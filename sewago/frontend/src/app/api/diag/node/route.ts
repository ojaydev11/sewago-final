import 'server-only';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function GET() {
  // Guard should be active here — DOM access must explode.
  let guardOk = false;
  try {
    // @ts-expect-error deliberate
    // eslint-disable-next-line no-undef
    document.title; // should throw from ssr-dom-guard on Node
  } catch {
    guardOk = true;
  }
  return NextResponse.json({ runtime: 'nodejs', guardOk });
}
