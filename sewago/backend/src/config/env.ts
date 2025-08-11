import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sewago",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  accessTokenSecret:
    process.env.JWT_ACCESS_SECRET ?? "insecure_dev_access_secret_change_me",
  refreshTokenSecret:
    process.env.JWT_REFRESH_SECRET ?? "insecure_dev_refresh_secret_change_me",
  accessTokenTtlMin: Number(process.env.ACCESS_TOKEN_TTL_MIN ?? 15),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),
  esewaMerchantCode: process.env.ESewa_MERCHANT_CODE ?? "",
  khaltiSecretKey: process.env.Khalti_SECRET_KEY ?? "",
} as const;

export const isProd = env.nodeEnv === "production";


