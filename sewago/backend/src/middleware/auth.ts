import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export function requireAuth(
  roles: Array<"user" | "provider" | "admin"> = ["user", "provider", "admin"]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    try {
      const payload = verifyAccessToken(token);
      if (!roles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.userId = payload.sub;
      req.userRole = payload.role;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

// Export authMiddleware for compatibility with existing imports
export const authMiddleware = requireAuth();
