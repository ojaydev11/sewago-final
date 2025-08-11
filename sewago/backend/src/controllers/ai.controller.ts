import { Request, Response } from "express";
import { ServiceModel } from "../models/Service.js";

// Simple heuristic-based recommender (placeholder for ML/LLM)
export async function suggest(req: Request, res: Response) {
  const { category, location } = req.query as Record<string, string>;
  const filter: any = {};
  if (category) filter.category = category;
  if (location) filter.location = location;
  const services = await ServiceModel.find(filter).sort({ rating: -1, ratingCount: -1 }).limit(10);
  res.json(services);
}


