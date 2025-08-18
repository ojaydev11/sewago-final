import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/db.js";
import { createApp } from "./app.js";
import { pathToFileURL } from "url";

export async function bootstrap() {
  await connectToDatabase();

  const app = createApp();
  
  // Production server optimizations for high traffic
  const server = http.createServer({
    // Keep-alive timeout (Railway usually handles this, but good to set)
    keepAliveTimeout: 65000, // Slightly higher than Railway's load balancer
    headersTimeout: 66000,   // Higher than keepAliveTimeout
  }, app);
  
  // Set server timeouts for production
  server.timeout = 120000; // 2 minutes
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  const io = new SocketIOServer(server, {
    cors: { origin: env.clientOrigin, credentials: true },
    path: "/ws/socket.io",
  }).of("/ws");
  // Redis adapter can be enabled by providing pub/sub clients; omitted for now

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
    console.log(`✓ API server running on port ${env.port}`);
    console.log(`✓ Health endpoint: http://localhost:${env.port}/api/health`);
    console.log(`✓ Metrics endpoint: http://localhost:${env.port}/api/metrics`);
    console.log(`✓ Environment: ${env.nodeEnv}`);
    console.log(`✓ CORS origin: ${env.clientOrigin}`);
  });
  
  // Graceful shutdown handlers
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    server.close(() => {
      console.log('✓ HTTP server closed');
    });
    
    // Close socket.io connections
    io.close(() => {
      console.log('✓ Socket.IO connections closed');
    });
    
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
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


