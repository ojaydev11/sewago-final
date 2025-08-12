import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/db.js";
import { createApp } from "./app.js";
import { pathToFileURL } from "url";

export async function bootstrap() {
  await connectToDatabase();

  const app = createApp();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: env.clientOrigin, credentials: true },
    path: "/ws/socket.io",
  }).of("/ws");
  io.adapter(require("@socket.io/redis-adapter").createAdapter?.(undefined as any) ?? undefined);

  // Socket.io basic events for chat and live booking updates
  io.on("connection", (socket) => {
    socket.on("join:booking", (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
    });
    socket.on("message:send", (payload: { bookingId: string; message: any }) => {
      io.to(`booking:${payload.bookingId}`).emit("message:new", payload.message);
    });
    socket.on("booking:update", (payload: { bookingId: string; status: string }) => {
      io.to(`booking:${payload.bookingId}`).emit("booking:status", payload.status);
    });
  });

  server.listen(env.port, () => {
    console.log(`API on http://localhost:${env.port}/api`);
  });
}

const isDirectRun = (() => {
  try {
    const argHref = pathToFileURL(process.argv[1] ?? "").href;
    return import.meta.url === argHref;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  bootstrap().catch((err) => {
    console.error("Fatal error during bootstrap", err);
    process.exit(1);
  });
}


