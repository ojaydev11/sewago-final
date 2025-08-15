import http from "http";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/db.js";
import { createApp } from "./app.js";
import { createSocketServer } from "./socket-server.js";
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
        return import.meta.url === argHref;
    }
    catch {
        return false;
    }
})();
if (isDirectRun) {
    bootstrap().catch((err) => {
        console.error("Fatal error during bootstrap", err);
        process.exit(1);
    });
}
