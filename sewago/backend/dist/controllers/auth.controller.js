"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_js_1 = require("../models/User.js");
const jwt_js_1 = require("../utils/jwt.js");
const REFRESH_COOKIE = "sewago_rt";
async function register(req, res) {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await User_js_1.UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
        return res.status(409).json({ message: "Email or phone already in use" });
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const user = await User_js_1.UserModel.create({ name, email, phone, passwordHash, role: role !== null && role !== void 0 ? role : "user" });
    const accessToken = (0, jwt_js_1.signAccessToken)({ sub: String(user._id), role: user.role });
    const refreshToken = (0, jwt_js_1.signRefreshToken)({ sub: String(user._id), role: user.role });
    const refreshTokenHash = await bcrypt_1.default.hash(refreshToken, 12);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();
    res
        .cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: true,
        path: "/api/auth/refresh",
    })
        .status(201)
        .json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
}
async function login(req, res) {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
        return res.status(400).json({ message: "Missing credentials" });
    }
    const user = await User_js_1.UserModel.findOne({
        $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const isValid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!isValid)
        return res.status(401).json({ message: "Invalid credentials" });
    const accessToken = (0, jwt_js_1.signAccessToken)({ sub: String(user._id), role: user.role });
    const refreshToken = (0, jwt_js_1.signRefreshToken)({ sub: String(user._id), role: user.role });
    user.refreshTokenHash = await bcrypt_1.default.hash(refreshToken, 12);
    await user.save();
    res
        .cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: true,
        path: "/api/auth/refresh",
    })
        .json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
}
async function refresh(req, res) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[REFRESH_COOKIE];
    if (!token)
        return res.status(401).json({ message: "Missing refresh token" });
    try {
        const payload = (0, jwt_js_1.verifyRefreshToken)(token);
        const user = await User_js_1.UserModel.findById(payload.sub);
        if (!user || !user.refreshTokenHash)
            return res.status(401).json({ message: "Invalid token" });
        const match = await bcrypt_1.default.compare(token, user.refreshTokenHash);
        if (!match)
            return res.status(401).json({ message: "Invalid token" });
        const accessToken = (0, jwt_js_1.signAccessToken)({ sub: String(user._id), role: user.role });
        const newRefreshToken = (0, jwt_js_1.signRefreshToken)({ sub: String(user._id), role: user.role });
        user.refreshTokenHash = await bcrypt_1.default.hash(newRefreshToken, 12);
        await user.save();
        res
            .cookie(REFRESH_COOKIE, newRefreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: true,
            path: "/api/auth/refresh",
        })
            .json({ accessToken });
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}
async function logout(req, res) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[REFRESH_COOKIE];
    if (token) {
        try {
            const payload = (0, jwt_js_1.verifyRefreshToken)(token);
            await User_js_1.UserModel.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: 1 } });
        }
        catch { }
    }
    res
        .clearCookie(REFRESH_COOKIE, {
        path: "/api/auth/refresh",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: true,
    })
        .json({ success: true });
}
async function me(req, res) {
    if (!req.userId)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await User_js_1.UserModel.findById(req.userId).select("name email phone role avatarUrl");
    if (!user)
        return res.status(404).json({ message: "Not found" });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatarUrl: user.avatarUrl });
}
