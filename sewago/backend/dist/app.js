import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import { env, isProd } from "./config/env.js";
import { api } from "./routes/index.js";
export function createApp() {
    const app = express();
    app.set("trust proxy", true);
    app.use(cors({ origin: env.clientOrigin, credentials: true }));
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
    app.use(mongoSanitize());
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
