"use client";
import { socket } from "@/lib/socket";

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

type Message = { _id: string; fromUserId: string; toUserId: string; content: string; createdAt: string };

export default function ChatPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params?.bookingId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    socket.emit("join:booking", bookingId);
    api.get<Message[]>(`/messages/${bookingId}`).then((res) => setMessages(res.data));
    const onNew = (message: Message) => setMessages((m) => [...m, message]);
    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [bookingId]);

  const send = async () => {
    if (!bookingId) return;
    const res = await api.post(`/messages/${bookingId}`, { content });
    socket.emit("message:send", { bookingId, message: res.data });
    setContent("");
  };

  if (!bookingId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="text-center text-gray-500">Invalid booking ID</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="border rounded h-[60vh] overflow-y-auto p-3 space-y-2">
        {messages.map((m) => (
          <div key={m._id} className="bg-gray-50 rounded p-2 text-sm">{m.content}</div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message" />
        <button className="bg-blue-700 text-white px-4 py-2 rounded" onClick={send}>Send</button>
      </div>
    </div>
  );
}


