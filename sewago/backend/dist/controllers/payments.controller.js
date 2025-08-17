"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esewaInitiate = esewaInitiate;
exports.khaltiInitiate = khaltiInitiate;
async function esewaInitiate(_req, res) {
    res.json({ ok: true, provider: "esewa", payload: { referenceId: `ESEWA_${Date.now()}`, payUrl: "https://esewa.com.np/#/home" } });
}
async function khaltiInitiate(_req, res) {
    res.json({ ok: true, provider: "khalti", payload: { referenceId: `KHALTI_${Date.now()}`, payUrl: "https://khalti.com/" } });
}
