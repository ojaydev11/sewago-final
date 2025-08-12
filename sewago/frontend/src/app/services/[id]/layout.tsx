import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Service = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  images?: string[];
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  const siteBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { id } = await params;
  try {
    const resp = await fetch(`${apiBase}/services/${id}`, { cache: "no-store" });
    if (!resp.ok) throw new Error(String(resp.status));
    const s = (await resp.json()) as Service;
    const title = `${s.title} | SewaGo`;
    const description = (s.description ?? "Discover local services on SewaGo").slice(0, 160);
    const url = `${siteBase}/services/${id}`;
    const image = s.images?.[0] ? [{ url: s.images[0] }] : undefined;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        images: image,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    const url = `${siteBase}/services/${id}`;
    return {
      title: "Service | SewaGo",
      description: "Discover local services on SewaGo",
      alternates: { canonical: url },
      robots: { index: true, follow: true },
    };
  }
}

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


