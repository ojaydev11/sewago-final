import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/db.js";
import { createApp } from "./app.js";
async function bootstrap() {
    await connectToDatabase();
    const app = createApp();
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
        cors: { origin: env.clientOrigin, credentials: true },
        path: "/ws/socket.io",
    }).of("/ws");
    // Socket.io basic events for chat and live booking updates
    io.on("connection", (socket) => {
        socket.on("join:booking", (bookingId) => {
            socket.join(`booking:${bookingId}`);
        });
        socket.on("message:send", (payload) => {
            io.to(`booking:${payload.bookingId}`).emit("message:new", payload.message);
        });
        socket.on("booking:update", (payload) => {
            io.to(`booking:${payload.bookingId}`).emit("booking:status", payload.status);
        });
    });
    server.listen(env.port, () => {
        console.log(`API listening on http://localhost:${env.port}`);
    });
}
bootstrap().catch((err) => {
    console.error("Fatal error during bootstrap", err);
    process.exit(1);
});
