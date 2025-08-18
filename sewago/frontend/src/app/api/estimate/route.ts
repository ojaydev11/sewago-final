import { NextRequest } from "next/server";

export const runtime = "edge";

type EstimateBody = {
  serviceType?: string;
  city?: string;
  hours?: number;
  extras?: string[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as EstimateBody;
  const hours = Math.max(1, Math.min(12, Number(body.hours ?? 1)));
  const baseByService: Record<string, number> = {
    plumbing: 700,
    electrical: 800,
    cleaning: 500,
    moving: 1200,
    repairs: 600,
    gardening: 400,
  };
  const base = baseByService[(body.serviceType || "").toLowerCase()] ?? 600;
  const cityMultiplier = /kathmandu|lalitpur|bhaktapur/i.test(body.city || "") ? 1.15 : 1.0;
  const extrasCount = Array.isArray(body.extras) ? body.extras.length : 0;
  const extrasFee = extrasCount * 150;
  const min = Math.round((base * hours * cityMultiplier) + extrasFee);
  const max = Math.round(min * 1.4);
  // Log for analytics without external dependencies
  try {
    // eslint-disable-next-line no-console
    console.log("estimate:event", { ...body, hours, min, max });
  } catch {}
  return new Response(JSON.stringify({ min, max, currency: "NPR" }), { headers: { "content-type": "application/json" } });
}