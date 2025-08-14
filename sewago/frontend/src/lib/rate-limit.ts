const hits = new Map<string, { count: number; ts: number }>()

export function rateLimit(ip: string, windowMs = 300000, limit = 60) {
  const now = Date.now()
  const rec = hits.get(ip) ?? { count: 0, ts: now }
  
  if (now - rec.ts > windowMs) {
    rec.count = 0
    rec.ts = now
  }
  
  rec.count++
  hits.set(ip, rec)
  
  return rec.count <= limit
}
