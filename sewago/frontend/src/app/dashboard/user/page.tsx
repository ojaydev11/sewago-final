"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Booking = { _id: string; status: string; price: number; createdAt: string };

export default function UserDashboard() {
  const { data } = useQuery({ queryKey: ["my-bookings"], queryFn: async () => (await api.get<Booking[]>("/bookings/me")).data });
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <div className="grid gap-3">
        {data?.map((b) => (
          <div key={b._id} className="border rounded p-3 flex items-center justify-between">
            <span>{b.status}</span>
            <span>Rs. {b.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


