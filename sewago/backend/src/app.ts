import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
<<<<<<< HEAD
// express-mongo-sanitize is not compatible with Express 5 (req.query setter).
// Implement a minimal sanitizer that removes keys starting with '$' or containing '.'.
import xss from "xss-clean";
=======
// Custom XSS and NoSQL injection protection middleware
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { env, isProd } from "./config/env.js";
import { api } from "./routes/index.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import client from "prom-client";
import NotificationService from "./lib/services/NotificationService.js";

export function createApp(io?: any) {
  const app = express();
  
  // Store Socket.IO instance for use in controllers
  if (io) {
    app.set('io', io);
    
    // Initialize NotificationService with Socket.IO instance
    const notificationService = NotificationService.getInstance();
    notificationService.setSocketIO(io);
  }
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
  morgan.token("reqId", (_req, res) => (res as any)?.locals?.requestId ?? "-");
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
      const route = (req as any).route?.path ?? req.path ?? "unknown";
      end({ method: req.method, route, code: String(res.statusCode) });
    });
    next();
  });

  // Health and readiness endpoints early, before potentially incompatible middlewares
  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, service: "sewago-backend", env: process.env.NODE_ENV || "dev" })
  );
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
<<<<<<< HEAD
    // Global baseline rate limit
=======
    // Global baseline rate limit (disable trust proxy validation for development)
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    app.use(
      rateLimit({
        windowMs: 60 * 1000,
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
<<<<<<< HEAD
=======
        validate: {
          trustProxy: false, // Disable trust proxy validation for development
        },
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      })
    );
    // Stricter rate limit for login
    app.use(
      "/api/auth/login",
      rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: "too_many_login_attempts" },
<<<<<<< HEAD
=======
        validate: {
          trustProxy: false, // Disable trust proxy validation for development
        },
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      })
    );
    // Moderate rate limit for bookings creation/updates
    app.use(
      ["/api/bookings", "/api/messages"],
      rateLimit({
        windowMs: 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
<<<<<<< HEAD
=======
        validate: {
          trustProxy: false, // Disable trust proxy validation for development
        },
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      })
    );
  }
  const sanitizeInPlace = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(sanitizeInPlace);
      return;
    }
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
        continue;
      }
      sanitizeInPlace(obj[key]);
    }
  };
  app.use((req, _res, next) => {
    sanitizeInPlace(req.query as unknown);
    sanitizeInPlace(req.params as unknown);
    sanitizeInPlace(req.body as unknown);
    // Do not mutate headers structure; skipping for safety
    next();
  });
<<<<<<< HEAD
  app.use(xss());
=======
  // Custom XSS sanitization middleware
  app.use((req, res, next) => {
    const sanitizeXSS = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            obj[key] = sanitizeXSS(obj[key]);
          }
        }
      }
      return obj;
    };

    // Sanitize request body
    if (req.body) {
      req.body = sanitizeXSS(req.body);
    }
    
    // Sanitize query parameters by creating a new object
    if (req.query) {
      const sanitizedQuery: any = {};
      for (const key in req.query) {
        if (req.query.hasOwnProperty(key)) {
          sanitizedQuery[key] = sanitizeXSS(req.query[key]);
        }
      }
      // Replace the query object instead of modifying properties
      Object.defineProperty(req, 'query', {
        value: sanitizedQuery,
        writable: true,
        configurable: true
      });
    }
    
    next();
  });
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(logFormat));
  app.use("/api", api);
  // Generic 404 for unknown API routes (after routers)
  app.use("/api", (_req, res, _next) => {
    res.status(404).json({ message: "not_found", requestId: (res as any)?.locals?.requestId });
  });
  // Basic error handler for tests and development
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error("Express error:", err, "reqId=", (res as any)?.locals?.requestId);
    res.status(500).json({ message: "internal_error", requestId: (res as any)?.locals?.requestId });
  });
  return app;
}