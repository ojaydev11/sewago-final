"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { useMemo, useState } from "react";

type Service = {
  _id: string;
  title: string;
  category: string;
  basePrice: number;
  location: string;
  rating?: number;
};

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("highest");
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({ q, category, city, sort, page, limit: 12 }), [q, category, city, sort, page]);
  const { data, isLoading } = useQuery({
    queryKey: ["services", params],
    queryFn: async () => {
      const resp = await api.get<Service[]>("/services", { params });
      const total = Number(resp.headers["x-total-count"] ?? 0);
      const perPage = Number(resp.headers["x-per-page"] ?? 12);
      return { items: resp.data, total, perPage };
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
          placeholder="Search services..."
          className="border rounded px-3 py-2 w-full md:w-1/3"
        />
        <input
          value={city}
          onChange={(e) => { setPage(1); setCity(e.target.value); }}
          placeholder="City"
          className="border rounded px-3 py-2 w-full md:w-52"
        />
        <select
          value={category}
          onChange={(e) => { setPage(1); setCategory(e.target.value); }}
          className="border rounded px-3 py-2 w-full md:w-52"
        >
          <option value="">All categories</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="cleaning">Cleaning</option>
          <option value="moving">Moving</option>
          <option value="repairs">Repairs</option>
          <option value="gardening">Gardening</option>
        </select>
        <select
          value={sort}
          onChange={(e) => { setPage(1); setSort(e.target.value); }}
          className="border rounded px-3 py-2 w-full md:w-40"
        >
          <option value="highest">Top rated</option>
          <option value="lowest">Price: Low to High</option>
          <option value="nearest">Newest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded p-4 animate-pulse">
            <div className="h-4 w-2/3 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-1/2 bg-slate-200 rounded mb-6" />
            <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
          </div>
        ))}
        {data?.items.map((s) => (
          <Link key={s._id} href={`/services/${s._id}`} className="border rounded p-4 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.category} • {s.location}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Rs. {s.basePrice}</p>
                <p className="text-xs text-slate-500">⭐ {s.rating ?? 0}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border rounded px-3 py-1 disabled:opacity-50"
          >Prev</button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border rounded px-3 py-1 disabled:opacity-50"
          >Next</button>
        </div>
      )}
    </div>
  );
}


