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
  allowSeeding: process.env.ALLOW_SEEDING === "true",
  seedKey: process.env.SEED_KEY ?? "",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 200),
  loginRateLimitMax: Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 5),
  bookingRateLimitMax: Number(process.env.BOOKING_RATE_LIMIT_MAX ?? 30),
  enableMetrics: process.env.ENABLE_METRICS !== "false",
  enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== "false",
} as const;

export const isProd = env.nodeEnv === "production";

// Validate required production environment variables
if (isProd) {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET', 
    'JWT_REFRESH_SECRET',
    'CLIENT_ORIGIN'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate JWT secret lengths
  if (env.accessTokenSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long in production');
  }
  
  if (env.refreshTokenSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long in production');
  }
}


