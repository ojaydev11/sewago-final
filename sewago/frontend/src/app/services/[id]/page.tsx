"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

type Service = {
  _id: string;
  title: string;
  description: string;
  basePrice: number;
  location: string;
  providerId: string;
};

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => (await api.get<Service>(`/services/${id}`)).data,
    enabled: Boolean(id),
  });
  const book = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const now = new Date();
      const body = {
        serviceId: id,
        date: now.toISOString(),
        timeSlot: "10:00-11:00",
        price: 1500,
        address: "Kathmandu",
        payment: { method: "cash" },
      };
      await api.post("/bookings", body);
    },
  });
  if (!data) return null;
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p className="text-slate-700 mt-2">{data.description}</p>
      <div className="mt-4 flex items-center justify-between border rounded p-3">
        <span>Rs. {data.basePrice}</span>
        <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => book.mutate()}>{book.isPending ? "Booking..." : "Book Now"}</button>
      </div>
    </div>
  );
}


