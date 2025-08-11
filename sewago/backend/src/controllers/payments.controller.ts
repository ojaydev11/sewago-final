import { Request, Response } from "express";

export async function esewaInitiate(_req: Request, res: Response) {
  res.json({ ok: true, provider: "esewa", payload: { referenceId: `ESEWA_${Date.now()}`, payUrl: "https://esewa.com.np/#/home" } });
}

export async function khaltiInitiate(_req: Request, res: Response) {
  res.json({ ok: true, provider: "khalti", payload: { referenceId: `KHALTI_${Date.now()}`, payUrl: "https://khalti.com/" } });
}


