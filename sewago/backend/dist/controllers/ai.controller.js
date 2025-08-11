import { ServiceModel } from "../models/Service.js";
// Simple heuristic-based recommender (placeholder for ML/LLM)
export async function suggest(req, res) {
    const { category, location } = req.query;
    const filter = {};
    if (category)
        filter.category = category;
    if (location)
        filter.location = location;
    const services = await ServiceModel.find(filter).sort({ rating: -1, ratingCount: -1 }).limit(10);
    res.json(services);
}
