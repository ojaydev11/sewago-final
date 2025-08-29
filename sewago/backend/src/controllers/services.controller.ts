import { Request, Response } from "express";
import { ServiceModel } from "../models/Service.js";

export async function listServices(req: Request, res: Response) {
<<<<<<< HEAD
  const { q, category, location, city, min, max, rating, sort, page, limit } = req.query as Record<string, string>;
  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  const loc = city ?? location;
  if (loc) filter.location = loc;
  if (min || max) filter.basePrice = {
    ...(min ? { $gte: Number(min) } : {}),
    ...(max ? { $lte: Number(max) } : {}),
  };
  if (rating) filter.rating = { $gte: Number(rating) };
  const sortMap: Record<string, any> = {
    nearest: { createdAt: -1 },
    highest: { rating: -1 },
    lowest: { basePrice: 1 },
  };
  const sortSpec = sortMap[sort ?? "highest"] ?? { rating: -1 };
  const pageNum = Math.max(1, Number(page ?? 1));
  const perPage = Math.min(50, Math.max(1, Number(limit ?? 12)));
  const total = await ServiceModel.countDocuments(filter);
  const services = await ServiceModel.find(filter)
    .sort(sortSpec)
    .skip((pageNum - 1) * perPage)
    .limit(perPage);
  res.setHeader("X-Total-Count", String(total));
  res.setHeader("X-Page", String(pageNum));
  res.setHeader("X-Per-Page", String(perPage));
  res.json(services);
=======
  try {
    console.log("🔍 Services endpoint called with query:", req.query);
    
    const { q, category, location, city, min, max, rating, sort, page, limit } = req.query as Record<string, string>;
    const filter: any = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    const loc = city ?? location;
    if (loc) filter.location = loc;
    if (min || max) filter.basePrice = {
      ...(min ? { $gte: Number(min) } : {}),
      ...(max ? { $lte: Number(max) } : {}),
    };
    if (rating) filter.rating = { $gte: Number(rating) };
    
    console.log("🎯 Services filter:", filter);
    
    const sortMap: Record<string, any> = {
      nearest: { createdAt: -1 },
      highest: { rating: -1 },
      lowest: { basePrice: 1 },
    };
    const sortSpec = sortMap[sort ?? "highest"] ?? { rating: -1 };
    const pageNum = Math.max(1, Number(page ?? 1));
    const perPage = Math.min(50, Math.max(1, Number(limit ?? 12)));
    
    console.log("📊 Counting services...");
    const total = await ServiceModel.countDocuments(filter);
    
    console.log("📋 Finding services...");
    const services = await ServiceModel.find(filter)
      .sort(sortSpec)
      .skip((pageNum - 1) * perPage)
      .limit(perPage);
      
    console.log(`✅ Found ${services.length} services out of ${total} total`);
    
    res.setHeader("X-Total-Count", String(total));
    res.setHeader("X-Page", String(pageNum));
    res.setHeader("X-Per-Page", String(perPage));
    res.json(services);
  } catch (error) {
    console.error("❌ Services error:", error);
    res.status(500).json({ error: "Failed to fetch services", details: error });
  }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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


