"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.requireAuth = requireAuth;
const jwt_js_1 = require("../utils/jwt.js");
function requireAuth(roles = ["user", "provider", "admin"]) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))
            ? authHeader.slice("Bearer ".length)
            : undefined;
        if (!token) {
            return res.status(401).json({ message: "Missing token" });
        }
        try {
            const payload = (0, jwt_js_1.verifyAccessToken)(token);
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
// Export authMiddleware for compatibility with existing imports
exports.authMiddleware = requireAuth();
