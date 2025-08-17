"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listServices = listServices;
exports.getService = getService;
exports.createService = createService;
exports.updateService = updateService;
exports.deleteService = deleteService;
const Service_js_1 = require("../models/Service.js");
async function listServices(req, res) {
    var _a;
    const { q, category, location, city, min, max, rating, sort, page, limit } = req.query;
    const filter = {};
    if (q)
        filter.$text = { $search: q };
    if (category)
        filter.category = category;
    const loc = city !== null && city !== void 0 ? city : location;
    if (loc)
        filter.location = loc;
    if (min || max)
        filter.basePrice = {
            ...(min ? { $gte: Number(min) } : {}),
            ...(max ? { $lte: Number(max) } : {}),
        };
    if (rating)
        filter.rating = { $gte: Number(rating) };
    const sortMap = {
        nearest: { createdAt: -1 },
        highest: { rating: -1 },
        lowest: { basePrice: 1 },
    };
    const sortSpec = (_a = sortMap[sort !== null && sort !== void 0 ? sort : "highest"]) !== null && _a !== void 0 ? _a : { rating: -1 };
    const pageNum = Math.max(1, Number(page !== null && page !== void 0 ? page : 1));
    const perPage = Math.min(50, Math.max(1, Number(limit !== null && limit !== void 0 ? limit : 12)));
    const total = await Service_js_1.ServiceModel.countDocuments(filter);
    const services = await Service_js_1.ServiceModel.find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * perPage)
        .limit(perPage);
    res.setHeader("X-Total-Count", String(total));
    res.setHeader("X-Page", String(pageNum));
    res.setHeader("X-Per-Page", String(perPage));
    res.json(services);
}
async function getService(req, res) {
    const service = await Service_js_1.ServiceModel.findById(req.params.id);
    if (!service)
        return res.status(404).json({ message: "Not found" });
    res.json(service);
}
async function createService(req, res) {
    const providerId = req.userId;
    if (!providerId)
        return res.status(401).json({ message: "Unauthorized" });
    const { title, category, description, basePrice, images, location } = req.body;
    const service = await Service_js_1.ServiceModel.create({
        title,
        category,
        description,
        basePrice,
        images: images !== null && images !== void 0 ? images : [],
        location,
        providerId,
    });
    res.status(201).json(service);
}
async function updateService(req, res) {
    const providerId = req.userId;
    const { id } = req.params;
    const service = await Service_js_1.ServiceModel.findOneAndUpdate({ _id: id, providerId }, req.body, { new: true });
    if (!service)
        return res.status(404).json({ message: "Not found" });
    res.json(service);
}
async function deleteService(req, res) {
    const providerId = req.userId;
    const { id } = req.params;
    const deleted = await Service_js_1.ServiceModel.findOneAndDelete({ _id: id, providerId });
    if (!deleted)
        return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
}
