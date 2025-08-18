import type { Request } from "express";

const toInt = (v: unknown, d = 0) =>
  (typeof v === "string" && /^\d+$/.test(v) ? parseInt(v, 10) : d);

const asString = (v: unknown) => (typeof v === "string" ? v : undefined);

export function getServiceQuery(req: Request) {
  const q = req.query as Record<string, unknown>;
  return {
    page: Math.max(1, toInt(q.page, 1)),
    limit: Math.min(100, Math.max(1, toInt(q.limit, 20))),
    category: asString(q.category),
    q: asString(q.q),
    sort: asString(q.sort),
  };
}


