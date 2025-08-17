"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggest = suggest;
const Service_js_1 = require("../models/Service.js");
// Simple heuristic-based recommender (placeholder for ML/LLM)
async function suggest(req, res) {
    const { category, location } = req.query;
    const filter = {};
    if (category)
        filter.category = category;
    if (location)
        filter.location = location;
    const services = await Service_js_1.ServiceModel.find(filter).sort({ rating: -1, ratingCount: -1 }).limit(10);
    res.json(services);
}
