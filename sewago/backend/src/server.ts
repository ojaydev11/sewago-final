import http from "http";
import { env } from "./config/env";
import { connectToDatabase } from "./config/db";
import { createApp } from "./app";
import { createSocketServer } from "./socket-server";
import { pathToFileURL } from "url";

export async function bootstrap() {
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


