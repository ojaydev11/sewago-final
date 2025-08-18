import express from "express";
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
// New security middleware
import { securityHeaders, corsSecurityHeaders } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
export function createApp() {
    const app = express();
    app.set("trust proxy", true);
    // Enhanced security headers
    app.use(securityHeaders);
    app.use(corsSecurityHeaders);
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
    if (env.enableHealthChecks) {
        app.get("/api/health", (_req, res) => res.json({
            ok: true,
            service: "sewago-backend",
            env: process.env.NODE_ENV || "dev",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        app.get("/api/ready", (_req, res) => {
            const ready = mongoose.connection.readyState === 1; // 1 = connected
            res.status(ready ? 200 : 503).json({
                ok: ready,
                dbState: mongoose.connection.readyState,
                timestamp: new Date().toISOString()
            });
        });
    }
    if (env.enableMetrics) {
        app.get("/api/metrics", async (_req, res) => {
            res.setHeader("Content-Type", register.contentType);
            res.end(await register.metrics());
        });
    }
    const isTest = env.nodeEnv === "test";
    if (!isTest) {
        app.use(helmet());
        // Global baseline rate limit
        app.use(rateLimit({
            windowMs: env.rateLimitWindowMs,
            max: env.rateLimitMaxRequests,
            standardHeaders: true,
            legacyHeaders: false,
        }));
        // Stricter rate limit for login
        app.use("/api/auth/login", rateLimit({
            windowMs: env.rateLimitWindowMs,
            max: env.loginRateLimitMax,
            standardHeaders: true,
            legacyHeaders: false,
            message: { message: "too_many_login_attempts" },
        }));
        // Moderate rate limit for bookings creation/updates
        app.use(["/api/bookings", "/api/messages"], rateLimit({
            windowMs: env.rateLimitWindowMs,
            max: env.bookingRateLimitMax,
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
    // Enhanced error handling
    app.use("/api", notFoundHandler);
    app.use(errorHandler);
    return app;
}
