"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Service = { _id: string; title: string; basePrice: number; location: string; rating?: number };

export default function CategoryServicesPage() {
  const { category } = useParams<{ category: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const location = search.get("location") ?? "";
  const { data } = useQuery({
    queryKey: ["services", category, location],
    queryFn: async () => (await api.get<Service[]>("/services", { params: { category, location } })).data,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <input className="border rounded px-3 py-2" placeholder="Location" defaultValue={location} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v = (e.target as HTMLInputElement).value;
            router.push(`/services/category/${category}?location=${encodeURIComponent(v)}`);
          }
        }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data?.map((s) => (
          <a key={s._id} href={`/services/${s._id}`} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-slate-600">{category} • {s.location}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Rs. {s.basePrice}</p>
                <p className="text-xs text-slate-500">⭐ {s.rating ?? 0}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


