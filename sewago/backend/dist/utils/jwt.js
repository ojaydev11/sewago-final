import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function signAccessToken(payload) {
    return jwt.sign(payload, env.accessTokenSecret, {
        expiresIn: `${env.accessTokenTtlMin}m`,
    });
}
export function signRefreshToken(payload) {
    return jwt.sign(payload, env.refreshTokenSecret, {
        expiresIn: `${env.refreshTokenTtlDays}d`,
    });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.accessTokenSecret);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.refreshTokenSecret);
}
