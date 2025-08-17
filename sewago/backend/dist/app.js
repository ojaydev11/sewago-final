"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// express-mongo-sanitize is not compatible with Express 5 (req.query setter).
// Implement a minimal sanitizer that removes keys starting with '$' or containing '.'.
const xss_clean_1 = __importDefault(require("xss-clean"));
const env_js_1 = require("./config/env.js");
const index_js_1 = require("./routes/index.js");
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const prom_client_1 = __importDefault(require("prom-client"));
const NotificationService_js_1 = __importDefault(require("./lib/services/NotificationService.js"));
function createApp(io) {
    const app = (0, express_1.default)();
    // Store Socket.IO instance for use in controllers
    if (io) {
        app.set('io', io);
        // Initialize NotificationService with Socket.IO instance
        const notificationService = NotificationService_js_1.default.getInstance();
        notificationService.setSocketIO(io);
    }
    app.set("trust proxy", true);
    app.use((0, cors_1.default)({ origin: env_js_1.env.clientOrigin, credentials: true }));
    // Global gzip compression for payloads
    app.use((0, compression_1.default)());
    // ---- Request ID + Metrics instrumentation ----
    // Request ID middleware
    app.use((req, res, next) => {
        const incomingId = req.header("x-request-id");
        const requestId = incomingId && incomingId.trim().length > 0 ? incomingId : (0, uuid_1.v4)();
        res.locals.requestId = requestId;
        res.setHeader("x-request-id", requestId);
        next();
    });
    // Morgan log format with request id
    morgan_1.default.token("reqId", (_req, res) => { var _a, _b; return (_b = (_a = res === null || res === void 0 ? void 0 : res.locals) === null || _a === void 0 ? void 0 : _a.requestId) !== null && _b !== void 0 ? _b : "-"; });
    const logFormat = env_js_1.isProd
        ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" reqId=:reqId'
        : ':method :url :status :response-time ms - :res[content-length] reqId=:reqId';
    // ---- Prometheus metrics ----
    const register = new prom_client_1.default.Registry();
    prom_client_1.default.collectDefaultMetrics({ register });
    const httpRequestDurationMs = new prom_client_1.default.Histogram({
        name: "http_request_duration_ms",
        help: "Duration of HTTP requests in ms",
        labelNames: ["method", "route", "code"],
        buckets: [50, 100, 200, 300, 500, 1000, 2000, 5000],
        registers: [register],
    });
    app.use((req, res, next) => {
        const end = httpRequestDurationMs.startTimer();
        res.on("finish", () => {
            var _a, _b, _c;
            const route = (_c = (_b = (_a = req.route) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : req.path) !== null && _c !== void 0 ? _c : "unknown";
            end({ method: req.method, route, code: String(res.statusCode) });
        });
        next();
    });
    // Health and readiness endpoints early, before potentially incompatible middlewares
    app.get("/api/health", (_req, res) => res.json({ ok: true, service: "sewago-backend", env: process.env.NODE_ENV || "dev" }));
    app.get("/api/ready", (_req, res) => {
        const ready = mongoose_1.default.connection.readyState === 1; // 1 = connected
        res.status(ready ? 200 : 503).json({ ok: ready, dbState: mongoose_1.default.connection.readyState });
    });
    app.get("/api/metrics", async (_req, res) => {
        res.setHeader("Content-Type", register.contentType);
        res.end(await register.metrics());
    });
    const isTest = env_js_1.env.nodeEnv === "test";
    if (!isTest) {
        app.use((0, helmet_1.default)());
        // Global baseline rate limit
        app.use((0, express_rate_limit_1.default)({
            windowMs: 60 * 1000,
            max: 200,
            standardHeaders: true,
            legacyHeaders: false,
        }));
        // Stricter rate limit for login
        app.use("/api/auth/login", (0, express_rate_limit_1.default)({
            windowMs: 60 * 1000,
            max: 5,
            standardHeaders: true,
            legacyHeaders: false,
            message: { message: "too_many_login_attempts" },
        }));
        // Moderate rate limit for bookings creation/updates
        app.use(["/api/bookings", "/api/messages"], (0, express_rate_limit_1.default)({
            windowMs: 60 * 1000,
            max: 30,
            standardHeaders: true,
            legacyHeaders: false,
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
    app.use((0, xss_clean_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)(logFormat));
    app.use("/api", index_js_1.api);
    // Generic 404 for unknown API routes (after routers)
    app.use("/api", (_req, res, _next) => {
        var _a;
        res.status(404).json({ message: "not_found", requestId: (_a = res === null || res === void 0 ? void 0 : res.locals) === null || _a === void 0 ? void 0 : _a.requestId });
    });
    // Basic error handler for tests and development
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
        var _a, _b;
        // eslint-disable-next-line no-console
        console.error("Express error:", err, "reqId=", (_a = res === null || res === void 0 ? void 0 : res.locals) === null || _a === void 0 ? void 0 : _a.requestId);
        res.status(500).json({ message: "internal_error", requestId: (_b = res === null || res === void 0 ? void 0 : res.locals) === null || _b === void 0 ? void 0 : _b.requestId });
    });
    return app;
}
