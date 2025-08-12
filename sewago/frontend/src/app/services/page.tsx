"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";

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
  const { data } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await api.get<Service[]>("/services")).data,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data?.map((s) => (
        <Link key={s._id} href={`/services/${s._id}`} className="border rounded p-4">
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
  );
}


