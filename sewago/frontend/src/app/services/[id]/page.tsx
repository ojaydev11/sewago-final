"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

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
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [address, setAddress] = useState("");
  const [step, setStep] = useState(1);

  const isStep1Valid = useMemo(() => Boolean(date && timeSlot), [date, timeSlot]);
  const isStep2Valid = useMemo(() => address.trim().length >= 5, [address]);

  const book = useMutation({
    mutationFn: async () => {
      if (!id || !isStep1Valid || !isStep2Valid) return;
      const body = {
        serviceId: id,
        date: new Date(date).toISOString(),
        timeSlot,
        price: data?.basePrice ?? 0,
        address,
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
      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm mb-4">
          <div className={`h-2 flex-1 rounded ${step >= 1 ? "bg-red-600" : "bg-slate-200"}`} />
          <div className={`h-2 flex-1 rounded ${step >= 2 ? "bg-red-600" : "bg-slate-200"}`} />
          <div className={`h-2 flex-1 rounded ${step >= 3 ? "bg-red-600" : "bg-slate-200"}`} />
        </div>

        {step === 1 && (
          <div className="border rounded p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium">Time Slot</label>
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="border rounded px-3 py-2 w-full">
                <option value="">Select...</option>
                <option value="09:00-10:00">09:00-10:00</option>
                <option value="10:00-11:00">10:00-11:00</option>
                <option value="11:00-12:00">11:00-12:00</option>
                <option value="13:00-14:00">13:00-14:00</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="border rounded p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City" className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="border px-4 py-2 rounded">Back</button>
              <button
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="border rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Price</span>
              <span className="font-semibold">Rs. {data.basePrice}</span>
            </div>
            <div className="text-sm text-slate-700">
              <div>Date: {date}</div>
              <div>Time: {timeSlot}</div>
              <div>Address: {address}</div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="border px-4 py-2 rounded">Back</button>
              <button
                onClick={() => book.mutate()}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >{book.isPending ? "Booking..." : "Confirm Booking"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


