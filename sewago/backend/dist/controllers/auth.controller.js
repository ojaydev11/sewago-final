import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, } from "../utils/jwt.js";
const REFRESH_COOKIE = "sewago_rt";
export async function register(req, res) {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
        return res.status(409).json({ message: "Email or phone already in use" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, phone, passwordHash, role: role ?? "user" });
    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();
    res
        .cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/api/auth/refresh",
    })
        .status(201)
        .json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
}
export async function login(req, res) {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
        return res.status(400).json({ message: "Missing credentials" });
    }
    const user = await UserModel.findOne({
        $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
        return res.status(401).json({ message: "Invalid credentials" });
    const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
    const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();
    res
        .cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/api/auth/refresh",
    })
        .json({ accessToken, user: { id: user._id, name: user.name, role: user.role } });
}
export async function refresh(req, res) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token)
        return res.status(401).json({ message: "Missing refresh token" });
    try {
        const payload = verifyRefreshToken(token);
        const user = await UserModel.findById(payload.sub);
        if (!user || !user.refreshTokenHash)
            return res.status(401).json({ message: "Invalid token" });
        const match = await bcrypt.compare(token, user.refreshTokenHash);
        if (!match)
            return res.status(401).json({ message: "Invalid token" });
        const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
        const newRefreshToken = signRefreshToken({ sub: String(user._id), role: user.role });
        user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);
        await user.save();
        res
            .cookie(REFRESH_COOKIE, newRefreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/api/auth/refresh",
        })
            .json({ accessToken });
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}
export async function logout(req, res) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
        try {
            const payload = verifyRefreshToken(token);
            await UserModel.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: 1 } });
        }
        catch { }
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth/refresh" }).json({ success: true });
}
export async function me(req, res) {
    if (!req.userId)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await UserModel.findById(req.userId).select("name email phone role avatarUrl");
    if (!user)
        return res.status(404).json({ message: "Not found" });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatarUrl: user.avatarUrl });
}
