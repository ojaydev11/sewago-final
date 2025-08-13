import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
// express-mongo-sanitize is not compatible with Express 5 (req.query setter).
// Implement a minimal sanitizer that removes keys starting with '$' or containing '.'.
import xss from "xss-clean";
import { env, isProd } from "./config/env.js";
import { api } from "./routes/index.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import client from "prom-client";
export function createApp() {
    const app = express();
    app.set("trust proxy", true);
    app.use(cors({ origin: env.clientOrigin, credentials: true }));
    // Global gzip compression for payloads
    app.use(compression());
    // ---- Request ID + Metrics instrumentation ----
    // Request ID middleware
    app.use((req, res, next) => {
        const incomingId = req.header("x-request-id");
        const requestId = incomingId && incomingId.trim().length > 0 ? incomingId : uuidv4();
        res.locals.requestId = requestId;
        res.setHeader("x-request-id", requestId);
        next();
    });
    // Morgan log format with request id
    morgan.token("reqId", (_req, res) => res?.locals?.requestId ?? "-");
    const logFormat = isProd
        ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" reqId=:reqId'
        : ':method :url :status :response-time ms - :res[content-length] reqId=:reqId';
    // ---- Prometheus metrics ----
    const register = new client.Registry();
    client.collectDefaultMetrics({ register });
    const httpRequestDurationMs = new client.Histogram({
        name: "http_request_duration_ms",
        help: "Duration of HTTP requests in ms",
        labelNames: ["method", "route", "code"],
        buckets: [50, 100, 200, 300, 500, 1000, 2000, 5000],
        registers: [register],
    });
    app.use((req, res, next) => {
        const end = httpRequestDurationMs.startTimer();
        res.on("finish", () => {
            const route = req.route?.path ?? req.path ?? "unknown";
            end({ method: req.method, route, code: String(res.statusCode) });
        });
        next();
    });
    // Health and readiness endpoints early, before potentially incompatible middlewares
    app.get("/api/health", (_req, res) => res.json({ ok: true, service: "sewago-backend", env: process.env.NODE_ENV || "dev" }));
    app.get("/api/ready", (_req, res) => {
        const ready = mongoose.connection.readyState === 1; // 1 = connected
        res.status(ready ? 200 : 503).json({ ok: ready, dbState: mongoose.connection.readyState });
    });
    app.get("/api/metrics", async (_req, res) => {
        res.setHeader("Content-Type", register.contentType);
        res.end(await register.metrics());
    });
    const isTest = env.nodeEnv === "test";
    if (!isTest) {
        app.use(helmet());
        // Global baseline rate limit
        app.use(rateLimit({
            windowMs: 60 * 1000,
            max: 200,
            standardHeaders: true,
            legacyHeaders: false,
        }));
        // Stricter rate limit for login
        app.use("/api/auth/login", rateLimit({
            windowMs: 60 * 1000,
            max: 5,
            standardHeaders: true,
            legacyHeaders: false,
            message: { message: "too_many_login_attempts" },
        }));
        // Moderate rate limit for bookings creation/updates
        app.use(["/api/bookings", "/api/messages"], rateLimit({
            windowMs: 60 * 1000,
            max: 30,
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: (req) => req.userId ?? req.ip,
        }));
    }
    const sanitizeInPlace = (value) => {
        if (!value || typeof value !== "object")
            return;
        if (Array.isArray(value)) {
            value.forEach(sanitizeInPlace);
            return;
        }
        const obj = value;
        for (const key of Object.keys(obj)) {
            if (key.startsWith("$") || key.includes(".")) {
                delete obj[key];
                continue;
            }
            sanitizeInPlace(obj[key]);
        }
    };
    app.use((req, _res, next) => {
        sanitizeInPlace(req.query);
        sanitizeInPlace(req.params);
        sanitizeInPlace(req.body);
        // Do not mutate headers structure; skipping for safety
        next();
    });
    app.use(xss());
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(morgan(logFormat));
    app.use("/api", api);
    // Generic 404 for unknown API routes (after routers)
    app.use("/api", (_req, res, _next) => {
        res.status(404).json({ message: "not_found", requestId: res.locals?.requestId });
    });
    // Basic error handler for tests and development
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
        // eslint-disable-next-line no-console
        console.error("Express error:", err, "reqId=", res.locals?.requestId);
        res.status(500).json({ message: "internal_error", requestId: res.locals?.requestId });
    });
    return app;
}
