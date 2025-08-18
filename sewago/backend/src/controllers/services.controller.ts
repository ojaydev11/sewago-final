import { Request, Response } from "express";
import { ServiceModel } from "../models/Service.js";
import { getServiceQuery } from "../utils/query.js";

export async function listServices(req: Request, res: Response) {
  try {
    const { page, limit, category, q, sort } = getServiceQuery(req);
    const raw = req.query as Record<string, unknown>;

    const filter: any = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    const loc = (typeof raw.city === "string" ? raw.city : undefined) ?? (typeof raw.location === "string" ? raw.location : undefined);
    if (loc) filter.location = loc;
    const min = typeof raw.min === "string" && /^\d+$/.test(raw.min) ? Number(raw.min) : undefined;
    const max = typeof raw.max === "string" && /^\d+$/.test(raw.max) ? Number(raw.max) : undefined;
    if (min !== undefined || max !== undefined) {
      filter.basePrice = {
        ...(min !== undefined ? { $gte: min } : {}),
        ...(max !== undefined ? { $lte: max } : {}),
      };
    }
    const rating = typeof raw.rating === "string" && /^\d+$/.test(raw.rating) ? Number(raw.rating) : undefined;
    if (rating !== undefined) filter.rating = { $gte: rating };

    const sortMap: Record<string, any> = {
      nearest: { createdAt: -1 },
      highest: { rating: -1 },
      lowest: { basePrice: 1 },
    };
    const sortSpec = sortMap[sort ?? "highest"] ?? { rating: -1 };

    const total = await ServiceModel.countDocuments(filter);
    const services = await ServiceModel.find(filter)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page,
        limit,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
}

export async function getService(req: Request, res: Response) {
  const service = await ServiceModel.findById(req.params.id);
  if (!service) return res.status(404).json({ message: "Not found" });
  res.json(service);
}

export async function createService(req: Request, res: Response) {
  const providerId = req.userId;
  if (!providerId) return res.status(401).json({ message: "Unauthorized" });
  const { title, category, description, basePrice, images, location } = req.body;
  const service = await ServiceModel.create({
    title,
    category,
    description,
    basePrice,
    images: images ?? [],
    location,
    providerId,
  });
  res.status(201).json(service);
}

export async function updateService(req: Request, res: Response) {
  const providerId = req.userId;
  const { id } = req.params;
  const service = await ServiceModel.findOneAndUpdate(
    { _id: id, providerId },
    req.body,
    { new: true }
  );
  if (!service) return res.status(404).json({ message: "Not found" });
  res.json(service);
}

export async function deleteService(req: Request, res: Response) {
  const providerId = req.userId;
  const { id } = req.params;
  const deleted = await ServiceModel.findOneAndDelete({ _id: id, providerId });
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ success: true });
}


