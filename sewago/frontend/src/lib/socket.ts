import { io } from "socket.io-client";

const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ?? "http://localhost:4000";
export const socket = io(`${base}/ws`, {
  withCredentials: true,
  path: "/ws/socket.io",
});


