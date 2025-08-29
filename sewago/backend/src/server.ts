import http from "http";
import { env } from "./config/env";
import { connectToDatabase } from "./config/db";
import { createApp } from "./app";
import { createSocketServer } from "./socket-server";
import { pathToFileURL } from "url";

export async function bootstrap() {
<<<<<<< HEAD
  await connectToDatabase();

  const server = http.createServer();
  
  // Create Socket.IO server
  const io = createSocketServer(server);
  
  // Create Express app with Socket.IO instance
  const app = createApp(io);
  server.on('request', app);
  
  server.listen(env.port, () => {
    console.log(`API on http://localhost:${env.port}/api`);
    console.log(`WebSocket server ready on port ${env.port}`);
  });
=======
  try {
    console.log("🚀 Starting SewaGo Backend Server...");
    console.log(`📍 Environment: ${env.nodeEnv}`);
    console.log(`🔌 Port: ${env.port}`);
    
    await connectToDatabase();
    console.log("✅ Database connection established");

    const server = http.createServer();
    
    // Create Socket.IO server
    const io = createSocketServer(server);
    console.log("✅ WebSocket server initialized");
    
    // Create Express app with Socket.IO instance
    const app = createApp(io);
    server.on('request', app);
    console.log("✅ Express app configured");
    
    server.listen(env.port, () => {
      console.log(`🎉 SewaGo API running on http://localhost:${env.port}/api`);
      console.log(`🔥 WebSocket server ready on port ${env.port}`);
      console.log("🛡️  Enterprise security enabled");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("🔧 Please check your configuration and try again");
    process.exit(1);
  }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
}

const isDirectRun = (() => {
  try {
    const argHref = pathToFileURL(process.argv[1] ?? "").href;
    const currentFileUrl = pathToFileURL(__filename).href;
    return currentFileUrl === argHref;
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


