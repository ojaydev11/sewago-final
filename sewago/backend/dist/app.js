import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
// express-mongo-sanitize is not compatible with Express 5 (req.query setter).
// Implement a minimal sanitizer that removes keys starting with '$' or containing '.'.
import xss from "xss-clean";
import { env, isProd } from "./config/env.js";
import { api } from "./routes/index.js";
export function createApp() {
    const app = express();
    app.set("trust proxy", true);
    app.use(cors({ origin: env.clientOrigin, credentials: true }));
    // Health endpoint early, before potentially incompatible middlewares
    app.get("/api/health", (_req, res) => res.json({ ok: true, service: "sewago-backend", env: process.env.NODE_ENV || "dev" }));
    const isTest = env.nodeEnv === "test";
    if (!isTest) {
        app.use(helmet());
        app.use(rateLimit({
            windowMs: 60 * 1000,
            max: 200,
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
    app.use(xss());
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(morgan(isProd ? "combined" : "dev"));
    app.use("/api", api);
    // Basic error handler for tests and development
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
        // eslint-disable-next-line no-console
        console.error("Express error:", err);
        res.status(500).json({ message: "internal_error" });
    });
    return app;
}
