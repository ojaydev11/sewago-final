import { Request, Response } from "express";
import crypto from "crypto";

export async function esewaInitiate(req: Request, res: Response) {
  const idempotencyKey = req.header("Idempotency-Key") ?? crypto.randomUUID();
  res.setHeader("Idempotency-Key", idempotencyKey);
  res.json({ ok: true, provider: "esewa", payload: { referenceId: `ESEWA_${Date.now()}`, payUrl: "https://esewa.com.np/#/home" } });
}

export async function khaltiInitiate(req: Request, res: Response) {
  const idempotencyKey = req.header("Idempotency-Key") ?? crypto.randomUUID();
  res.setHeader("Idempotency-Key", idempotencyKey);
  res.json({ ok: true, provider: "khalti", payload: { referenceId: `KHALTI_${Date.now()}`, payUrl: "https://khalti.com/" } });
}


