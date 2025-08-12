import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const intent = String(body?.intent ?? "").toLowerCase();
    const q = String(body?.q ?? "");

    let answer = "Hello! I'm SewaAI. How can I help you today?";
    if (intent.includes("find")) answer = `You can browse services on /services. Query: ${q || "(none)"}.`;
    else if (intent.includes("quote") || intent.includes("estimate")) answer = "Typical quotes range from Rs. 500 - 2,000 depending on service and hours.";
    else if (intent.includes("book")) answer = "To book, open a service detail and pick a date/time, then confirm.";
    else if (intent.includes("language") || intent.includes("switch")) answer = "Use the language switcher if available; otherwise English is default.";

    return new Response(JSON.stringify({ answer }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ answer: "Sorry, something went wrong." }), { status: 500, headers: { "content-type": "application/json" } });
  }
}


