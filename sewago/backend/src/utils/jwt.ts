import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  sub: string;
  role: "user" | "provider" | "admin";
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: `${env.accessTokenTtlMin}m`,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: `${env.refreshTokenTtlDays}d`,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.accessTokenSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.refreshTokenSecret) as JwtPayload;
}


