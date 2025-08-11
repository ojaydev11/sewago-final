import { verifyAccessToken } from "../utils/jwt.js";
export function requireAuth(roles = ["user", "provider", "admin"]) {
    return (req, res, next) => {
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
        }
        catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
}
