import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faqs`, changeFrequency: "monthly", priority: 0.5 },
  ];
  // Try to include service detail pages without failing generation
  try {
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const res = await fetch(`${api}/services?limit=100&page=1`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const items = (await res.json()) as Array<{ _id: string }>;
      for (const s of items) {
        routes.push({ url: `${base}/services/${s._id}`, changeFrequency: "weekly", priority: 0.6 });
      }
    }
  } catch {
    // ignore
  }
  return routes;
}


