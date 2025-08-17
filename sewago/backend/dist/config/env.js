"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : "development",
    port: Number((_b = process.env.PORT) !== null && _b !== void 0 ? _b : 4000),
    mongoUri: (_c = process.env.MONGODB_URI) !== null && _c !== void 0 ? _c : "mongodb://127.0.0.1:27017/sewago",
    clientOrigin: (_d = process.env.CLIENT_ORIGIN) !== null && _d !== void 0 ? _d : "http://localhost:3000",
    accessTokenSecret: (_e = process.env.JWT_ACCESS_SECRET) !== null && _e !== void 0 ? _e : "insecure_dev_access_secret_change_me",
    refreshTokenSecret: (_f = process.env.JWT_REFRESH_SECRET) !== null && _f !== void 0 ? _f : "insecure_dev_refresh_secret_change_me",
    accessTokenTtlMin: Number((_g = process.env.ACCESS_TOKEN_TTL_MIN) !== null && _g !== void 0 ? _g : 15),
    refreshTokenTtlDays: Number((_h = process.env.REFRESH_TOKEN_TTL_DAYS) !== null && _h !== void 0 ? _h : 30),
    esewaMerchantCode: (_j = process.env.ESewa_MERCHANT_CODE) !== null && _j !== void 0 ? _j : "",
    khaltiSecretKey: (_k = process.env.Khalti_SECRET_KEY) !== null && _k !== void 0 ? _k : "",
};
exports.isProd = exports.env.nodeEnv === "production";
