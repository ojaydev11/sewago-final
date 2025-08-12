import type { Metadata } from "next";
import React, { Suspense } from "react";
import { SeoJsonLd } from "@/app/components/SeoJsonLd";
import { SewaAIWidget } from "@/app/components/SewaAIWidget";
import ServicesClient from "./services.client";
import { QuoteEstimator } from "./quote-estimator.client";

export const revalidate = 3600;

type Service = {
  _id: string;
  title: string;
  category: string;
  basePrice: number;
  location: string;
  rating?: number;
};

export const metadata: Metadata = {
  title: "Services | SewaGo",
  description: "Find and book trusted local services in Nepal: plumbing, electrical, cleaning, moving, repairs, gardening.",
  alternates: {
    canonical: "/services",
    languages: process.env.NEXT_PUBLIC_I18N_ENABLED === "true"
      ? { en: "/en/services", ne: "/ne/services" }
      : undefined,
  },
  openGraph: {
    title: "SewaGo Services",
    description: "Discover reliable local services by category and city.",
    type: "website",
    url: "/services",
    images: [{ url: "/api/og/services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SewaGo Services",
    description: "Discover reliable local services by category and city.",
    images: ["/api/og/services"],
  },
};

async function fetchInitialServices(): Promise<{ items: Service[]; total: number; perPage: number }> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  const url = `${base}/services?limit=12&page=1`;
  try {
    const res = await fetch(url, { next: { revalidate }, cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items: Service[] = await res.json();
    const total = Number(res.headers.get("x-total-count") ?? items.length ?? 0);
    const perPage = Number(res.headers.get("x-per-page") ?? 12);
    return { items, total, perPage };
  } catch {
    return { items: [], total: 0, perPage: 12 };
  }
}

export default async function ServicesPage() {
  const initial = await fetchInitialServices();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "SewaGo Service Catalog",
    itemListElement: initial.items.slice(0, 12).map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        areaServed: s.location,
        category: s.category,
      },
      priceSpecification: { "@type": "UnitPriceSpecification", price: s.basePrice, priceCurrency: "NPR" },
    })),
    potentialAction: {
      "@type": "SearchAction",
      target: "/services?q={search_term}",
      "query-input": "required name=search_term",
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Services</h1>
      <SeoJsonLd data={jsonLd} />
      <Suspense>
        <ServicesClient initialItems={initial.items} initialTotal={initial.total} initialPerPage={initial.perPage} />
      </Suspense>
      <QuoteEstimator />
      <SewaAIWidget />
    </div>
  );
}


