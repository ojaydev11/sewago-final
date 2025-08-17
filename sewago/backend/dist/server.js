"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const app_1 = require("./app");
const socket_server_1 = require("./socket-server");
const url_1 = require("url");
async function bootstrap() {
    await (0, db_1.connectToDatabase)();
    const server = http_1.default.createServer();
    // Create Socket.IO server
    const io = (0, socket_server_1.createSocketServer)(server);
    // Create Express app with Socket.IO instance
    const app = (0, app_1.createApp)(io);
    server.on('request', app);
    server.listen(env_1.env.port, () => {
        console.log(`API on http://localhost:${env_1.env.port}/api`);
        console.log(`WebSocket server ready on port ${env_1.env.port}`);
    });
}
const isDirectRun = (() => {
    var _a;
    try {
        const argHref = (0, url_1.pathToFileURL)((_a = process.argv[1]) !== null && _a !== void 0 ? _a : "").href;
        const currentFileUrl = (0, url_1.pathToFileURL)(__filename).href;
        return currentFileUrl === argHref;
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
