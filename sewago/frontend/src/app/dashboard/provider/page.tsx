"use client";
export const dynamic = 'force-dynamic';

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Booking = { _id: string; status: string; price: number; createdAt: string };

export default function ProviderDashboard() {
  const { data } = useQuery({ queryKey: ["provider-bookings"], queryFn: async () => (await api.get<Booking[]>("/bookings/me")).data });
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Job Requests</h1>
      <div className="grid gap-3">
        {data?.map((b) => (
          <div key={b._id} className="border rounded p-3 flex items-center justify-between">
            <span>{b.status}</span>
            <span>Rs. {b.price}</span>
            <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={async () => { await api.patch(`/bookings/${b._id}/status`, { status: "completed" }); }}>Mark Completed</button>
          </div>
        ))}
      </div>
    </div>
  );
}


